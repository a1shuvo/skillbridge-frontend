import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import { headers } from "next/headers";

// Fetch stats directly with cookie forwarding
async function getDashboardStats() {
  try {
    const headersList = await headers();
    const cookie = headersList.get("cookie") || "";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/stats`,
      {
        headers: { cookie },
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!response.ok) return null;

    const result = await response.json();
    return result.data;
  } catch {
    return null;
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  if (!stats) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          Failed to load dashboard statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your platform statistics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.users.totalStudents}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.totalTutors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.users.verifiedTutors} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookings.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.bookings.pending} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.revenue.totalRevenue}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Confirmed</span>
              <span className="font-medium">{stats.bookings.confirmed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Completed</span>
              <span className="font-medium">{stats.bookings.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cancelled</span>
              <span className="font-medium">{stats.bookings.cancelled}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
