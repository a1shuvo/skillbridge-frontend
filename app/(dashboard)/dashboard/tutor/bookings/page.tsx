"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api";
import { tutorService, type TutorSession } from "@/lib/services/tutor.service";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, Loader2, Star, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TutorBookingsPage() {
  const [bookings, setBookings] = useState<TutorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        // Construct params carefully
        const params: { status?: string } = {};
        if (statusFilter !== "ALL") {
          params.status = statusFilter;
        }

        const response = await tutorService.getMyBookings(params);

        if (response.success) {
          setBookings(response.data);
        }
      } catch (err) {
        const error = err as ApiError;

        if (Array.isArray(error.data?.errors)) {
          // Handle Zod array issues
          error.data.errors.forEach((e) => toast.error(e.message));
        } else if (error.data?.errors) {
          // Handle Record<string, string>
          Object.values(error.data.errors).forEach((msg) =>
            toast.error(String(msg)),
          );
        } else {
          toast.error(error.data?.message || "An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [statusFilter]);

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
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Sessions</h1>
          <p className="text-muted-foreground text-sm">
            Manage your upcoming and past teaching appointments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Filter by:
          </span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sessions</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5 text-primary" />
            Sessions ({bookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center space-y-3">
              <div className="rounded-full bg-muted p-4">
                <Calendar className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium">No sessions found</p>
                <p className="text-sm text-muted-foreground">
                  {statusFilter !== "ALL"
                    ? `You don't have any ${statusFilter.toLowerCase()} sessions.`
                    : "Your scheduled sessions will appear here."}
                </p>
              </div>
              {statusFilter !== "ALL" && (
                <Button variant="link" onClick={() => setStatusFilter("ALL")}>
                  Show all sessions
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="w-62.5">Student</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Review</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow
                      key={booking.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {booking.student.name?.[0] || (
                              <User className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-sm truncate">
                              {booking.student.name || "Anonymous Student"}
                            </span>
                            <span className="text-xs text-muted-foreground truncate max-w-40">
                              {booking.student.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {booking.slot ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex flex-col text-sm">
                              <span className="font-medium whitespace-nowrap text-slate-700">
                                {format(
                                  parseISO(booking.slot.startTime),
                                  "MMM d, yyyy",
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(parseISO(booking.slot.startTime), "p")}{" "}
                                - {format(parseISO(booking.slot.endTime), "p")}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-destructive font-medium italic">
                            Slot deleted
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-right">
                        {booking.review ? (
                          <div className="flex items-center justify-end gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {booking.review.rating}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
