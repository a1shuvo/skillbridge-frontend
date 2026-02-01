"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { bookingService } from "@/lib/services/booking.service";
import type { TutorProfile } from "@/types";
import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BookingFormProps {
  tutor:
    | (TutorProfile & {
        user: {
          name: string | null;
          image: string | null;
          email: string;
        };
      })
    | null;
  slot: {
    id: string;
    startTime: string;
    endTime: string;
  } | null;
  initialError?: string | null;
}

export function BookingForm({ tutor, slot, initialError }: BookingFormProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Show initial error toast on mount
  useEffect(() => {
    if (initialError) {
      toast.error(initialError);
    }
  }, [initialError]);

  // Handle missing tutor or slot
  if (!tutor || !slot) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link href="/tutors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tutors
          </Link>
        </Button>

        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold">Unable to Load Booking</h2>
            <p className="text-muted-foreground">
              {initialError || "This tutor or time slot is not available."}
            </p>
            <Button asChild className="mt-4">
              <Link href="/tutors">Browse Other Tutors</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // After the return above, we know these are not null
  // But TypeScript might not narrow correctly, so we use const assignments
  const tutorData = tutor;
  const slotData = slot;

  const displayName = tutorData.user.name || "Anonymous Tutor";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const startTime = parseISO(slotData.startTime);
  const endTime = parseISO(slotData.endTime);

  async function handleBooking() {
    if (initialError) {
      toast.error(initialError);
      return;
    }

    setIsLoading(true);
    try {
      await bookingService.createBooking({
        tutorId: tutorData.userId,
        slotId: slotData.id,
        note: note.trim() || undefined,
      });

      toast.success("Booking confirmed!");
      setIsSuccess(true);

      setTimeout(() => {
        router.push("/dashboard/student/bookings");
      }, 2000);
    } catch (error: Error | unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create booking";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <Card className="text-center py-12">
        <CardContent className="space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
          <p className="text-muted-foreground">
            Your session with {displayName} has been scheduled.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to your bookings...
          </p>
        </CardContent>
      </Card>
    );
  }

  const isDisabled = !!initialError || isLoading;

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="pl-0">
        <Link href={`/tutors/${tutorData.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Link>
      </Button>

      {initialError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{initialError}</p>
        </div>
      )}

      <Card className={initialError ? "opacity-75" : ""}>
        <CardHeader>
          <CardTitle>Confirm Your Booking</CardTitle>
          <CardDescription>
            Review the details and add any notes for your tutor
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={tutorData.user.image || ""} alt={displayName} />
              <AvatarFallback className="text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{displayName}</h3>
              <p className="text-muted-foreground">
                {tutorData.headline || "Expert Tutor"}
              </p>
              <Badge variant="secondary" className="mt-1">
                ${tutorData.hourlyRate}/hour
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Session Details
            </h4>
            <div className="grid gap-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {format(startTime, "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">
                  {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">
                  {Math.round(
                    (endTime.getTime() - startTime.getTime()) /
                      (1000 * 60 * 60),
                  )}{" "}
                  hours
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Price</span>
                <span className="font-bold text-lg text-primary">
                  ${tutorData.hourlyRate}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="note" className="text-sm font-medium">
              Notes for Tutor (Optional)
            </label>
            <Textarea
              id="note"
              placeholder="What would you like to learn? Any specific topics or questions?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              disabled={isDisabled}
            />
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button
            className="w-full"
            size="lg"
            onClick={handleBooking}
            disabled={isDisabled}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : initialError ? (
              "Booking Unavailable"
            ) : (
              "Confirm Booking"
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            You can cancel up to 24 hours before the session
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
