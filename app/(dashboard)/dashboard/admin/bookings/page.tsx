"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { adminService, type AdminBooking } from "@/lib/services/admin.service";
import { Calendar, Loader2, RefreshCw, Search, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Define slot type for the formatter
interface SlotData {
  startTime: string;
  endTime: string;
  subject?: string | null;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await adminService.getAllBookings({
          status: statusFilter,
        });
        setBookings(response.data);
        setCurrentPage(1);
      } catch {
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [statusFilter]);

  const handleRefresh = () => {
    setStatusFilter("ALL");
    setSearchQuery("");
    setCurrentPage(1);

    const refresh = async () => {
      setLoading(true);
      try {
        const response = await adminService.getAllBookings({});
        setBookings(response.data);
        toast.success("Bookings refreshed");
      } catch {
        toast.error("Failed to refresh bookings");
      } finally {
        setLoading(false);
      }
    };
    refresh();
  };

  // Filter bookings locally by search query
  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchQuery.toLowerCase();
    const studentMatch =
      (booking.student.name?.toLowerCase() || "").includes(searchLower) ||
      booking.student.email.toLowerCase().includes(searchLower);
    const tutorMatch =
      (booking.tutor.name?.toLowerCase() || "").includes(searchLower) ||
      booking.tutor.email.toLowerCase().includes(searchLower);

    return studentMatch || tutorMatch;
  });

  // Client-side pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      PENDING: "secondary",
      CONFIRMED: "default",
      COMPLETED: "default",
      CANCELLED: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  // Fixed type - no more 'any'
  const formatSlotTime = (slot: SlotData | null) => {
    if (!slot) return "N/A";
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    return `${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bookings Management
          </h1>
          <p className="text-muted-foreground">
            View and manage all platform bookings and sessions.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student or tutor..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bookings ({filteredBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paginatedBookings.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <Calendar className="h-12 w-12 mb-4 opacity-50" />
              <p>No bookings found</p>
              {(statusFilter !== "ALL" || searchQuery) && (
                <Button
                  variant="link"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Tutor</TableHead>
                      <TableHead>Session Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Review</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {booking.student.name || "N/A"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {booking.student.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {booking.tutor.name || "N/A"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {booking.tutor.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="whitespace-nowrap">
                              {formatSlotTime(booking.slot)}
                            </span>
                            {booking.slot?.subject && (
                              <span className="text-muted-foreground">
                                {booking.slot.subject}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>
                          {booking.review ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center text-sm">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                <span>{booking.review.rating}/5</span>
                              </div>
                              {booking.review.comment && (
                                <span className="text-xs text-muted-foreground truncate max-w-37.5">
                                  &ldquo;{booking.review.comment}&rdquo;
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No review
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredBookings.length,
                    )}{" "}
                    of {filteredBookings.length} bookings
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
