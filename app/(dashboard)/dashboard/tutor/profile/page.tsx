"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { tutorService } from "@/lib/services/tutor.service";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TutorProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    headline: "",
    bio: "",
    location: "",
    hourlyRate: 0,
    experience: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await tutorService.getMyProfile();
        if (response.data) {
          const d = response.data;
          setFormData({
            headline: d.headline || "",
            bio: d.bio || "",
            location: d.location || "",
            hourlyRate: d.hourlyRate || 0,
            experience: d.experience || 0,
          });
        }
      } catch {
        toast.error("Could not load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Wrap the formData in a 'body' key to match your Zod schema
      await tutorService.updateProfile({ body: formData });
      toast.success("Profile updated!");
    } catch (err) {
      const error = err as ApiError;

      // Fallback logic to find the error message
      const errors = error.data?.errors as { body?: { _errors?: string[] } } | undefined;
      const errorMessage =
        error.data?.message ||
        errors?.body?._errors?.[0] ||
        "Failed to save changes";

      console.error("Full Error Object:", error);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input
              value={formData.headline}
              onChange={(e) =>
                setFormData({ ...formData, headline: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hourly Rate ($)</Label>
              <Input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hourlyRate: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Years Experience</Label>
              <Input
                type="number"
                value={formData.experience}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    experience: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              rows={6}
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
