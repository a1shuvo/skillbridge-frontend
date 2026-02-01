"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { get, put } from "@/lib/api";
import {
  Calendar,
  Edit2,
  Loader2,
  Mail,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await get<{ success: boolean; data: UserProfile }>(
        "/api/v1/auth/me",
      );
      setProfile(response.data);
      setEditName(response.data.name || "");
      setEditImage(response.data.image || "");
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await put("/api/v1/auth/me", {
        name: editName,
        image: editImage,
      });

      toast.success("Profile updated successfully");
      setIsEditing(false);
      fetchProfile();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(profile?.name || "");
    setEditImage(profile?.image || "");
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          View and manage your personal information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your account details and preferences
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.image || ""} alt={profile.name} />
              <AvatarFallback className="text-2xl">
                {profile.name?.charAt(0).toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="image">Profile Image URL</Label>
                  <Input
                    id="image"
                    placeholder="https://example.com/image.jpg"
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    className="w-75"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a URL for your profile picture
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              {isEditing ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                />
              ) : (
                <p className="text-sm font-medium">
                  {profile.name || "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <p className="text-sm font-medium">{profile.email}</p>
              {profile.emailVerified ? (
                <span className="inline-flex items-center rounded-full border border-green-600 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-yellow-600 px-2.5 py-0.5 text-xs font-semibold text-yellow-600">
                  Unverified
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                Role
              </Label>
              <p className="text-sm font-medium capitalize">
                {profile.role.toLowerCase()}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Member Since
              </Label>
              <p className="text-sm font-medium">
                {new Date(profile.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <Separator />

          {/* Account Status */}
          <div>
            <h4 className="text-sm font-medium mb-3">Account Status</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${profile.status === "ACTIVE" ? "bg-green-500" : "bg-yellow-500"}`}
                />
                <span className="text-sm capitalize">
                  {profile.status.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Password</h4>
              <p className="text-sm text-muted-foreground">
                Change your account password
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => toast.info("Password change feature coming soon")}
            >
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
