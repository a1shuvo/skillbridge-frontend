"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { tutorService } from "@/lib/services/tutor.service";
import { addMinutes, format, isBefore, startOfToday } from "date-fns";
import { AlertCircle, Clock, Loader2, Save, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface AvailabilitySlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

interface NewSlot {
  startTime: string;
  endTime: string;
}

export default function TutorAvailabilityPage() {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newSlots, setNewSlots] = useState<NewSlot[]>([]);

  const fetchAvailability = useCallback(async () => {
    try {
      // Use getMyProfile instead of getTutorById to avoid ID mismatch issues
      const response = await tutorService.getMyProfile();
      if (response.success && response.data) {
        setAvailability(response.data.availability || []);
      }
    } catch (err) {
      const error = err as ApiError;
      console.error("Fetch availability error:", error);
      toast.error("Failed to load availability");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleAddSlot = (hour: number) => {
    const start = new Date(selectedDate);
    start.setHours(hour, 0, 0, 0);
    const end = addMinutes(start, 60);

    const startTime = start.toISOString();
    const endTime = end.toISOString();

    // Logging here will show you if the time is valid before it hits the state
    console.log("Adding slot:", startTime);

    setNewSlots([...newSlots, { startTime, endTime }]);
  };

  const removePendingSlot = (index: number) => {
    setNewSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // We need to send something, even if we are clearing slots
    setSaving(true);
    try {
      // 1. Combine existing unbooked slots with the new ones
      // 2. Ensure they are all valid ISO strings for Zod's iso.datetime()
      const allSlots = [
        ...availability
          .filter((s) => !s.isBooked) // only keep unbooked ones to re-save
          .map((s) => ({
            startTime: new Date(s.startTime).toISOString(),
            endTime: new Date(s.endTime).toISOString(),
          })),
        ...newSlots.map((s) => ({
          startTime: new Date(s.startTime).toISOString(),
          endTime: new Date(s.endTime).toISOString(),
        })),
      ];

      // Wrap in 'body' as per your updateAvailabilitySchema
      const payload = {
        body: {
          slots: allSlots,
        },
      };

      await tutorService.updateAvailability(payload);

      toast.success("Availability updated");
      setNewSlots([]);
      await fetchAvailability(); // Refresh list from server
    } catch (err) {
      const error = err as ApiError;
      // Log exactly what Zod is complaining about
      console.error("Zod Error:", error.data?.errors);
      toast.error(
        error.data?.message || "Validation Error: Check slot formats",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Availability</h1>
          <p className="text-muted-foreground">
            Manage your teaching schedule.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || newSlots.length === 0}
          className="shadow-sm"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save{" "}
          {newSlots.length > 0 ? `${newSlots.length} New Slots` : "Changes"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Date Selection */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => isBefore(date, startOfToday())}
              className="rounded-md border mx-auto"
            />
          </CardContent>
        </Card>

        {/* Slot Selection */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Available Times for {format(selectedDate, "MMMM d")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {Array.from({ length: 24 }, (_, i) => {
                const isPending = newSlots.some(
                  (s) =>
                    new Date(s.startTime).getHours() === i &&
                    new Date(s.startTime).getDate() === selectedDate.getDate(),
                );
                const isExisting = availability.some(
                  (s) =>
                    new Date(s.startTime).getHours() === i &&
                    new Date(s.startTime).getDate() === selectedDate.getDate(),
                );

                return (
                  <Button
                    key={i}
                    variant={
                      isPending
                        ? "default"
                        : isExisting
                          ? "secondary"
                          : "outline"
                    }
                    size="sm"
                    disabled={isExisting}
                    onClick={() => handleAddSlot(i)}
                    className="text-xs"
                  >
                    {format(new Date().setHours(i, 0), "h:mm a")}
                  </Button>
                );
              })}
            </div>

            {newSlots.length > 0 && (
              <div className="rounded-lg border border-dashed p-4 bg-muted/30">
                <h4 className="text-sm font-medium mb-3">Pending New Slots</h4>
                <div className="flex flex-wrap gap-2">
                  {newSlots.map((slot, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="pl-2 pr-1 py-1 gap-1"
                    >
                      {format(new Date(slot.startTime), "MMM d, h:mm a")}
                      <button
                        onClick={() => removePendingSlot(idx)}
                        className="rounded-full p-0.5 hover:bg-destructive hover:text-white transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Published View */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {availability.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground">
                No availability slots set yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {[...availability]
                .sort(
                  (a, b) =>
                    new Date(a.startTime).getTime() -
                    new Date(b.startTime).getTime(),
                )
                .map((slot) => (
                  <Badge
                    key={slot.id}
                    variant={slot.isBooked ? "default" : "outline"}
                    className={
                      slot.isBooked ? "bg-green-600 hover:bg-green-600" : ""
                    }
                  >
                    {format(new Date(slot.startTime), "MMM d, h:mm a")}
                    {slot.isBooked && " (Booked)"}
                  </Badge>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
