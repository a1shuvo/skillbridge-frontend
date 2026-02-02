"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { get, patch } from "@/lib/api";
import {
  Calendar,
  Clock,
  Loader2,
  MessageSquare,
  Star,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { JSX, useEffect, useState } from "react";
import { toast } from "sonner";

interface Slot {
  id: string;
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  isBooked: boolean;
}

interface Booking {
  id: string;
  tutorId: string;
  studentId: string;
  slotId: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  note?: string | null;
  createdAt: string;
  completedAt?: string | null;
  cancelledAt?: string | null;
  slot: Slot;
  tutor: {
    name: string;
    email: string;
    image?: string | null;
  };
  student: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export default function StudentBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await get<{ success: boolean; data: Booking[] }>(
        "/api/v1/bookings",
      );
      setBookings(response.data);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      setCancelLoading(true);
      await patch(`/api/v1/bookings/${selectedBooking.id}/cancel`, {});
      toast.success("Booking cancelled successfully");
      setSelectedBooking(null);
      fetchBookings();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to cancel booking";
      toast.error(errorMessage);
    } finally {
      setCancelLoading(false);
    }
  };

  // Filter bookings by status
  const upcomingBookings = bookings.filter((b) => b.status === "CONFIRMED");

  const pastBookings = bookings.filter(
    (b) => b.status === "COMPLETED" || b.status === "CANCELLED",
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      PENDING: "secondary",
      CONFIRMED: "default",
      COMPLETED: "outline",
      CANCELLED: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  // Helper to format slot datetime
  const formatSlotDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatSlotTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">
          Manage your tutoring sessions and view your learning history.
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                getStatusBadge={getStatusBadge}
                formatSlotDate={formatSlotDate}
                formatSlotTime={formatSlotTime}
                onCancel={() => setSelectedBooking(booking)}
                showCancel
              />
            ))
          ) : (
            <EmptyState
              title="No upcoming sessions"
              description="You don't have any scheduled sessions. Book a tutor to get started!"
              action={
                <Button asChild>
                  <Link href="/tutors">Book a Session</Link>
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                getStatusBadge={getStatusBadge}
                formatSlotDate={formatSlotDate}
                formatSlotTime={formatSlotTime}
                showReview={booking.status === "COMPLETED"}
              />
            ))
          ) : (
            <EmptyState
              title="No past sessions"
              description="Your completed and cancelled sessions will appear here."
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={!!selectedBooking}
        onOpenChange={() => setSelectedBooking(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this session with{" "}
              {selectedBooking?.tutor.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">
                  {formatSlotDate(selectedBooking.slot.startTime)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">
                  {formatSlotTime(selectedBooking.slot.startTime)} -{" "}
                  {formatSlotTime(selectedBooking.slot.endTime)}
                </span>
              </div>
              {selectedBooking.note && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Note:</span>
                  <span className="font-medium">{selectedBooking.note}</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBooking(null)}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={cancelLoading}
            >
              {cancelLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Yes, Cancel Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Booking Card Component
interface BookingCardProps {
  booking: Booking;
  getStatusBadge: (status: string) => JSX.Element;
  formatSlotDate: (isoString: string) => string;
  formatSlotTime: (isoString: string) => string;
  onCancel?: () => void;
  showCancel?: boolean;
  showReview?: boolean;
}

function BookingCard({
  booking,
  getStatusBadge,
  formatSlotDate,
  formatSlotTime,
  onCancel,
  showCancel,
  showReview,
}: BookingCardProps) {
  const startTime = booking.slot.startTime;
  const isPast = new Date(startTime) < new Date();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tutor Info */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{booking.tutor.name}</h3>
              <p className="text-sm text-muted-foreground">
                {booking.tutor.email}
              </p>
            </div>
          </div>

          {/* Session Details */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatSlotDate(startTime)}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatSlotTime(startTime)} -{" "}
              {formatSlotTime(booking.slot.endTime)}
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-3">
            {getStatusBadge(booking.status)}

            {showCancel && !isPast && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                <XCircle className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}

            {showReview && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/student/reviews?booking=${booking.id}`}>
                  <Star className="h-4 w-4 mr-1" />
                  Review
                </Link>
              </Button>
            )}

            <Button variant="ghost" size="sm" asChild>
              <Link
                href={`/dashboard/student/messages?tutor=${booking.tutorId}`}
              >
                <MessageSquare className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {booking.note && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Note:</span> {booking.note}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Empty State Component
interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mt-1">
          {description}
        </p>
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  );
}
