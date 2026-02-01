"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { tutorService } from "@/lib/services/tutor.service";
import { addMinutes, format, isBefore, parseISO, startOfToday } from "date-fns";
import { AlertCircle, Clock, Loader2, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [removedSlotIds, setRemovedSlotIds] = useState<Set<string>>(new Set());

  // Fetch tutor profile which includes availability
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        // Get profile which contains availability slots
        const response = await tutorService.getMyProfile();
        if (response.data) {
          setAvailability(response.data.availability || []);
        }
      } catch (err) {
        const error = err as ApiError;
        toast.error(error.data?.message || "Failed to load availability");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  const handleAddSlot = (hour: number) => {
    const start = new Date(selectedDate);
    start.setHours(hour, 0, 0, 0);
    const end = addMinutes(start, 60);

    // Check if slot is in the past
    if (isBefore(start, new Date())) {
      toast.error("Cannot add slots in the past");
      return;
    }

    const startTime = start.toISOString();
    const endTime = end.toISOString();

    // Check for duplicates in new slots
    const isDuplicate = newSlots.some(
      (slot) => new Date(slot.startTime).getTime() === start.getTime(),
    );

    if (isDuplicate) {
      toast.error("This slot is already added");
      return;
    }

    setNewSlots((prev) => [...prev, { startTime, endTime }]);
  };

  const removeNewSlot = (index: number) => {
    setNewSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleRemoveExistingSlot = (slotId: string) => {
    setRemovedSlotIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slotId)) {
        newSet.delete(slotId);
      } else {
        newSet.add(slotId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    // Prepare final slots list:
    // - Keep existing unbooked slots NOT marked for removal
    // - Add all new slots
    const slotsToKeep = availability
      .filter((s) => !s.isBooked && !removedSlotIds.has(s.id))
      .map((s) => ({
        startTime: new Date(s.startTime).toISOString(),
        endTime: new Date(s.endTime).toISOString(),
      }));

    const allSlots = [...slotsToKeep, ...newSlots];

    if (allSlots.length === 0) {
      toast.error("Please add at least one availability slot");
      return;
    }

    setSaving(true);
    try {
      // Backend expects: { slots: [{ startTime, endTime }] }
      // It replaces ALL unbooked slots with this list
      await tutorService.updateAvailability({ slots: allSlots });

      toast.success("Availability updated successfully");
      setNewSlots([]);
      setRemovedSlotIds(new Set());

      // Refresh data
      const response = await tutorService.getMyProfile();
      if (response.data) {
        setAvailability(response.data.availability || []);
      }
    } catch (err) {
      const error = err as ApiError;
      console.error("Save error:", error);

      // Handle Zod validation errors
      if (error.data?.errorSources && Array.isArray(error.data.errorSources)) {
        error.data.errorSources.forEach(
          (err: { path: string; message: string }) => {
            // Path might be "body.slots", "body.slots.0.startTime", etc.
            if (err.path.includes("startTime")) {
              toast.error(`Invalid start time: ${err.message}`);
            } else if (err.path.includes("endTime")) {
              toast.error(`Invalid end time: ${err.message}`);
            } else if (err.path.includes("slots")) {
              toast.error(err.message);
            } else {
              toast.error(`${err.path}: ${err.message}`);
            }
          },
        );
      } else {
        toast.error(error.data?.message || "Failed to update availability");
      }
    } finally {
      setSaving(false);
    }
  };

  // Check if there are any changes to save
  const hasChanges = newSlots.length > 0 || removedSlotIds.size > 0;

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
            Manage your teaching schedule. Booked slots cannot be modified.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="shadow-sm"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
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
              Available Times for {format(selectedDate, "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {Array.from({ length: 24 }, (_, i) => {
                const slotTime = new Date(selectedDate);
                slotTime.setHours(i, 0, 0, 0);

                const isPast = isBefore(slotTime, new Date());
                const isNew = newSlots.some(
                  (s) =>
                    new Date(s.startTime).getHours() === i &&
                    new Date(s.startTime).getDate() === selectedDate.getDate(),
                );
                const isExisting = availability.some(
                  (s) =>
                    new Date(s.startTime).getHours() === i &&
                    new Date(s.startTime).getDate() ===
                      selectedDate.getDate() &&
                    !removedSlotIds.has(s.id),
                );
                const isBooked = availability.some(
                  (s) =>
                    new Date(s.startTime).getHours() === i &&
                    new Date(s.startTime).getDate() ===
                      selectedDate.getDate() &&
                    s.isBooked,
                );
                const isRemoved = availability.some(
                  (s) =>
                    new Date(s.startTime).getHours() === i &&
                    new Date(s.startTime).getDate() ===
                      selectedDate.getDate() &&
                    removedSlotIds.has(s.id),
                );

                return (
                  <Button
                    key={i}
                    variant={
                      isNew
                        ? "default"
                        : isRemoved
                          ? "outline"
                          : isBooked
                            ? "secondary"
                            : isExisting
                              ? "outline"
                              : "outline"
                    }
                    size="sm"
                    disabled={isPast || isBooked || isExisting}
                    onClick={() => handleAddSlot(i)}
                    className={`text-xs relative ${
                      isRemoved ? "opacity-50 line-through" : ""
                    } ${isBooked ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    {format(slotTime, "h:mm a")}
                    {isBooked && <span className="sr-only">(Booked)</span>}
                  </Button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-primary"></div>
                <span>New</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded border border-input"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-secondary"></div>
                <span>Booked (Locked)</span>
              </div>
            </div>

            {/* Pending Changes */}
            {(newSlots.length > 0 || removedSlotIds.size > 0) && (
              <div className="rounded-lg border border-dashed border-orange-300 p-4 bg-orange-50/30 dark:bg-orange-950/10">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Pending Changes
                </h4>

                {newSlots.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Adding:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {newSlots.map((slot, idx) => (
                        <Badge
                          key={idx}
                          variant="default"
                          className="pl-2 pr-1 py-1 gap-1"
                        >
                          {format(parseISO(slot.startTime), "MMM d, h:mm a")}
                          <button
                            onClick={() => removeNewSlot(idx)}
                            className="rounded-full p-0.5 hover:bg-destructive hover:text-white transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {removedSlotIds.size > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Removing:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availability
                        .filter((s) => removedSlotIds.has(s.id))
                        .map((slot) => (
                          <Badge
                            key={slot.id}
                            variant="outline"
                            className="pl-2 pr-1 py-1 gap-1 line-through opacity-60"
                          >
                            {format(parseISO(slot.startTime), "MMM d, h:mm a")}
                            <button
                              onClick={() => toggleRemoveExistingSlot(slot.id)}
                              className="rounded-full p-0.5 hover:bg-primary hover:text-white transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Current Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {availability.length === 0 && newSlots.length === 0 ? (
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
                .map((slot) => {
                  const isRemoved = removedSlotIds.has(slot.id);
                  return (
                    <Badge
                      key={slot.id}
                      variant={
                        slot.isBooked
                          ? "secondary"
                          : isRemoved
                            ? "outline"
                            : "default"
                      }
                      className={`pl-3 pr-2 py-1.5 gap-2 ${
                        slot.isBooked
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : isRemoved
                            ? "opacity-50 line-through"
                            : ""
                      }`}
                    >
                      <span>
                        {format(parseISO(slot.startTime), "MMM d, h:mm a")}
                        {slot.isBooked && " (Booked)"}
                      </span>

                      {!slot.isBooked && !isRemoved && (
                        <button
                          onClick={() => toggleRemoveExistingSlot(slot.id)}
                          className="rounded-full p-0.5 hover:bg-destructive hover:text-white transition-colors"
                          title="Remove slot"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}

                      {isRemoved && (
                        <button
                          onClick={() => toggleRemoveExistingSlot(slot.id)}
                          className="rounded-full p-0.5 hover:bg-primary hover:text-white transition-colors"
                          title="Undo remove"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  );
                })}

              {/* Show new slots in the list too */}
              {newSlots.map((slot, idx) => (
                <Badge
                  key={`new-${idx}`}
                  variant="default"
                  className="pl-3 pr-2 py-1.5 gap-2 bg-blue-600"
                >
                  {format(parseISO(slot.startTime), "MMM d, h:mm a")}
                  <span className="text-xs opacity-75">(New)</span>
                  <button
                    onClick={() => removeNewSlot(idx)}
                    className="rounded-full p-0.5 hover:bg-destructive hover:text-white transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
