"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { tutorService } from "@/lib/services/tutor.service";
import {
  Calendar,
  DollarSign,
  Loader2,
  PlusCircle,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TutorProfileData {
  id: string;
  bio: string | null;
  headline: string | null;
  location: string | null;
  hourlyRate: number;
  experience: number;
  totalSessions: number;
  totalReviews: number;
  avgRating: number;
  user: {
    name: string | null;
    email: string;
    image?: string | null;
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
}

export default function TutorDashboardPage() {
  const [profile, setProfile] = useState<TutorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewTutor, setIsNewTutor] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use getMyProfile() which looks up by the authenticated session's userId
        const response = await tutorService.getMyProfile();
        setProfile(response.data as unknown as TutorProfileData);
      } catch (error: unknown) {
        const apiError = error as ApiError;
        if (apiError.status === 404) {
          // This tutor exists in the User table but hasn't created a Profile record yet
          setIsNewTutor(true);
        } else {
          toast.error(apiError.message || "Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // State for tutors who have authenticated but have no Profile record in DB
  if (isNewTutor) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
        <div className="bg-primary/10 p-6 rounded-full">
          <Users className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Setup Your Profile</h1>
          <p className="text-muted-foreground max-w-sm">
            You are registered as a tutor, but you need to complete your profile
            details before you can start teaching.
          </p>
        </div>
        <Link href="/dashboard/tutor/profile">
          <Button size="lg" className="gap-2">
            <PlusCircle className="h-5 w-5" />
            Create Tutor Profile
          </Button>
        </Link>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {profile.user.name || "Tutor"}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your tutoring business.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.avgRating?.toFixed(1) || "0.0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {profile.totalReviews || 0} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hourly Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${profile.hourlyRate || 0}</div>
            <p className="text-xs text-muted-foreground">Base rate per hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.totalSessions || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.categories?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold">Profile Management</h3>
                <p className="text-sm text-muted-foreground">
                  Update bio, hourly rates, and expertise.
                </p>
              </div>
              <Link href="/dashboard/tutor/profile">
                <Button variant="secondary">Edit Profile</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold">Availability</h3>
                <p className="text-sm text-muted-foreground">
                  Set your teaching slots and schedule.
                </p>
              </div>
              <Link href="/dashboard/tutor/availability">
                <Button variant="secondary">Set Slots</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Public Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Headline</h4>
            <p className="text-sm text-muted-foreground">
              {profile.headline || "No headline set."}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">About Me</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {profile.bio || "Write something about your teaching style..."}
            </p>
          </div>
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Teaching Categories</h4>
            <div className="flex flex-wrap gap-2">
              {profile.categories?.length > 0 ? (
                profile.categories.map((item) => (
                  <Badge key={item.category.id} variant="outline">
                    {item.category.name}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  No categories selected yet.
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
