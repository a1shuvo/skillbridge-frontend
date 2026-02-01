import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CalendarCheck,
  Clock,
  History,
  Star,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

// Fetch student bookings (upcoming and past)
async function getStudentBookings() {
  try {
    const headersList = await headers();
    const cookie = headersList.get("cookie") || "";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings`,
      {
        headers: { cookie },
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!response.ok) return null;

    const result = await response.json();
    return result.data || [];
  } catch {
    return null;
  }
}

// Fetch student reviews to count them
async function getStudentReviews() {
  try {
    const headersList = await headers();
    const cookie = headersList.get("cookie") || "";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews`,
      {
        headers: { cookie },
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!response.ok) return [];

    const result = await response.json();
    return result.data || [];
  } catch {
    return [];
  }
}

interface Booking {
  id: string;
  tutor: {
    name: string;
  };
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
}

export default async function StudentDashboardPage() {
  const [bookings, reviews] = await Promise.all([
    getStudentBookings(),
    getStudentReviews(),
  ]);

  if (!bookings) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Failed to load dashboard data.</p>
      </div>
    );
  }

  // Calculate stats from bookings
  const upcomingBookings = bookings.filter(
    (b: Booking) => b.status === "CONFIRMED" || b.status === "PENDING",
  );
  const completedBookings = bookings.filter(
    (b: Booking) => b.status === "COMPLETED",
  );

  // Calculate total hours learned
  const hoursLearned = completedBookings.reduce(
    (total: number, booking: Booking) => {
      const start = new Date(`2000-01-01T${booking.startTime}`);
      const end = new Date(`2000-01-01T${booking.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    },
    0,
  );

  const stats = {
    totalSessions: completedBookings.length,
    upcomingSessions: upcomingBookings.length,
    hoursLearned: Math.round(hoursLearned),
    reviewsGiven: reviews.length,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Welcome back! 👋</h2>
          <p className="text-muted-foreground mt-1">
            Here`&apos;`s what`&apos;`s happening with your learning journey
          </p>
        </div>
        <Button asChild>
          <Link href="/tutors" className="flex items-center gap-2">
            <Calendar className="mr-2 h-4 w-4" />
            Book New Session
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">Completed sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
            <p className="text-xs text-muted-foreground">Scheduled sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hoursLearned}</div>
            <p className="text-xs text-muted-foreground">Total hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews Given</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reviewsGiven}</div>
            <p className="text-xs text-muted-foreground">Session reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your scheduled tutoring sessions</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/student/bookings">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.slice(0, 3).map((booking: Booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {booking.tutor?.name || "Tutor"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.subject}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(booking.date).toLocaleDateString()}
                        <Clock className="h-3 w-3 ml-2" />
                        {booking.startTime} - {booking.endTime}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      booking.status === "CONFIRMED" ? "default" : "secondary"
                    }
                  >
                    {booking.status.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming sessions</p>
              <Button className="mt-4" variant="outline" asChild>
                <Link href="/dashboard/student/book">
                  Book your first session
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Session History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You have completed {completedBookings.length} sessions. View your
              progress.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/student/bookings">View History</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You have given {reviews.length} reviews. Help tutors improve!
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/student/reviews">Manage Reviews</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
