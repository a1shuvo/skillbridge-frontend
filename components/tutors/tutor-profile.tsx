"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type {
  AvailabilitySlot,
  Review,
  TutorProfile as TutorProfileType,
} from "@/types";
import { format, isPast, parseISO } from "date-fns";
import {
  Calendar,
  CheckCircle,
  Clock,
  Globe,
  GraduationCap,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface TutorProfileProps {
  tutor: TutorProfileType & {
    user: {
      name: string | null;
      image: string | null;
      email: string;
    };
    reviews: Review[];
    availability: AvailabilitySlot[];
  };
}

export function TutorProfile({ tutor }: TutorProfileProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const displayName = tutor.user.name || "Anonymous Tutor";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Filter only future available slots and sort by date
  const availableSlots = tutor.availability
    .filter((slot) => !slot.isBooked && !isPast(parseISO(slot.startTime)))
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

  // Group by date
  const slotsByDate = availableSlots.reduce(
    (acc, slot) => {
      const date = format(parseISO(slot.startTime), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = [];
      acc[date].push(slot);
      return acc;
    },
    {} as Record<string, AvailabilitySlot[]>,
  );

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Card */}
          <Card className="overflow-hidden">
            <div className="relative h-32 md:h-48 bg-linear-to-r from-primary/20 to-primary/10">
              <div className="absolute -bottom-12 left-6">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={tutor.user.image || ""} alt={displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl md:text-4xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <CardContent className="pt-14 md:pt-16 pb-6 px-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {displayName}
                    </h1>
                    {tutor.isVerified && (
                      <Badge className="bg-blue-500 hover:bg-blue-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground mt-1">
                    {tutor.headline || "Expert Tutor"}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                    {tutor.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {tutor.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {tutor.languages.join(", ")}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {tutor.experience} years exp.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950/30 px-3 py-1.5 rounded-lg">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-lg">
                    {tutor.avgRating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    ({tutor.totalReviews})
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {tutor.categories.map((tc) => (
                  <Badge key={tc.categoryId} variant="secondary">
                    {tc.category.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {tutor.bio || "No bio available."}
              </p>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Reviews ({tutor.totalReviews})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tutor.reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No reviews yet. Be the first to book a session!
                </p>
              ) : (
                <div className="space-y-4">
                  {tutor.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {review.student?.name?.[0] || "A"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {review.student?.name || "Anonymous"}
                          </span>
                          <div className="flex items-center text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="ml-1 text-sm">
                              {review.rating}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(parseISO(review.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Booking Card */}
            <Card className="border-2 border-primary/20">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-center">Book a Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    ${tutor.hourlyRate}
                  </div>
                  <div className="text-sm text-muted-foreground">per hour</div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  <div>
                    <div className="font-semibold">{tutor.totalSessions}</div>
                    <div className="text-muted-foreground">Sessions</div>
                  </div>
                  <div>
                    <div className="font-semibold">
                      {tutor.languages.length}
                    </div>
                    <div className="text-muted-foreground">Languages</div>
                  </div>
                </div>

                {/* Book Now - Opens Availability Modal */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Select a Time Slot</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] pr-4">
                      {availableSlots.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No available slots
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {Object.entries(slotsByDate).map(([date, slots]) => (
                            <div key={date} className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">
                                {format(parseISO(date), "EEEE, MMMM d")}
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {slots.map((slot) => (
                                  <Button
                                    key={slot.id}
                                    variant={
                                      selectedSlot === slot.id
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    className="justify-start"
                                    onClick={() => setSelectedSlot(slot.id)}
                                  >
                                    {format(parseISO(slot.startTime), "h:mm a")}{" "}
                                    - {format(parseISO(slot.endTime), "h:mm a")}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    {selectedSlot ? (
                      <Button className="w-full" asChild>
                        <Link
                          href={`/tutors/${tutor.id}/book?slot=${selectedSlot}`}
                        >
                          Continue to Booking
                        </Link>
                      </Button>
                    ) : (
                      <Button className="w-full" disabled>
                        Continue to Booking
                      </Button>
                    )}
                  </DialogContent>
                </Dialog>

                <p className="text-xs text-center text-muted-foreground">
                  Free cancellation up to 24 hours before
                </p>
              </CardContent>
            </Card>

            {/* Quick Availability Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableSlots.slice(0, 3).map((slot) => (
                  <div
                    key={slot.id}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <span className="text-sm">
                      {format(parseISO(slot.startTime), "EEE, MMM d")}
                    </span>
                    <Badge variant="outline">
                      {format(parseISO(slot.startTime), "h:mm a")}
                    </Badge>
                  </div>
                ))}
                {availableSlots.length > 3 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full mt-2 text-sm">
                        View All {availableSlots.length} Slots
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>All Available Slots</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[60vh] pr-4">
                        <div className="space-y-4">
                          {Object.entries(slotsByDate).map(([date, slots]) => (
                            <div key={date} className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">
                                {format(parseISO(date), "EEEE, MMMM d")}
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {slots.map((slot) => (
                                  <Button
                                    key={slot.id}
                                    variant="outline"
                                    size="sm"
                                    asChild
                                  >
                                    <Link
                                      href={`/tutors/${tutor.id}/book?slot=${slot.id}`}
                                    >
                                      {format(
                                        parseISO(slot.startTime),
                                        "h:mm a",
                                      )}
                                    </Link>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
