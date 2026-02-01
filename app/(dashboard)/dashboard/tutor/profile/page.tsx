"use client";

import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { categoryService } from "@/lib/services/category.service";
import { tutorService } from "@/lib/services/tutor.service";
import { useForm } from "@tanstack/react-form";
import {
  BookOpen,
  Briefcase,
  DollarSign,
  Globe,
  Loader2,
  MapPin,
  Plus,
  RefreshCcw,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ProfileFormData {
  headline: string;
  bio: string;
  location: string;
  hourlyRate: number;
  experience: number;
  languages: string[];
  categories: string[];
}

export default function TutorProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const form = useForm({
    defaultValues: {
      headline: "",
      bio: "",
      location: "",
      hourlyRate: 500,
      experience: 0,
      languages: [] as string[],
      categories: [] as string[],
    },
    onSubmit: async ({ value }: { value: ProfileFormData }) => {
      setIsSaving(true);

      try {
        // Send data FLAT (not wrapped in body) to match backend service expectations
        // Backend service does: const { categories, ...profileData } = payload
        const payload = {
          headline: value.headline,
          bio: value.bio,
          location: value.location,
          hourlyRate: value.hourlyRate,
          experience: value.experience,
          languages: value.languages,
          categories: value.categories,
        };

        // Call API directly with flat structure
        // You need to update tutor.service.ts to accept Partial<TutorProfile> & { categories: string[] }
        // instead of { body: Record<...> }
        const response = await tutorService.updateProfile(
          payload as Record<
            string,
            string | number | boolean | null | string[]
          >,
        );

        if (response.data) {
          toast.success(
            isNewProfile ? "Profile created successfully!" : "Profile updated!",
          );
          setIsNewProfile(false);
          setLastSaved(new Date());

          // Update form with returned data to ensure sync
          const updatedData = response.data;
          form.reset({
            headline: updatedData.headline || "",
            bio: updatedData.bio || "",
            location: updatedData.location || "",
            hourlyRate: updatedData.hourlyRate || 500,
            experience: updatedData.experience || 0,
            languages: Array.isArray(updatedData.languages)
              ? updatedData.languages
              : [],
            categories:
              updatedData.categories?.map(
                (c: { category: { id: string } }) => c.category.id,
              ) || [],
          });
        }
      } catch (err) {
        const error = err as ApiError;
        console.error("Update failed:", error);
        toast.error(error.data?.message || "Failed to save changes");
      } finally {
        setIsSaving(false);
      }
    },
  });

  // Load profile data wrapped in useCallback
  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);

      const [profileRes, categoriesRes] = await Promise.all([
        tutorService.getMyProfile(),
        categoryService.getAllCategories(),
      ]);

      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      if (profileRes.data) {
        const data = profileRes.data;

        const hasNoProfileData =
          !data.headline && !data.bio && data.experience === 0;
        setIsNewProfile(hasNoProfileData);

        const formData: ProfileFormData = {
          headline: data.headline || "",
          bio: data.bio || "",
          location: data.location || "",
          hourlyRate: data.hourlyRate || 500,
          experience: data.experience || 0,
          languages: Array.isArray(data.languages) ? data.languages : [],
          categories:
            data.categories?.map(
              (c: { category: { id: string } }) => c.category.id,
            ) || [],
        };

        form.reset(formData);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Could not load profile");
    } finally {
      setIsLoading(false);
    }
  }, [form]);

  // Initial load
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Warn before leaving if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.state.isDirty) {
        e.preventDefault();
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.state.isDirty]);

  const addLanguage = () => {
    const trimmed = newLanguage.trim();
    if (!trimmed) return;

    const current = form.getFieldValue("languages");
    if (!current.includes(trimmed)) {
      form.setFieldValue("languages", [...current, trimmed]);
    }
    setNewLanguage("");
  };

  const removeLanguage = (langToRemove: string) => {
    const current = form.getFieldValue("languages");
    form.setFieldValue(
      "languages",
      current.filter((lang: string) => lang !== langToRemove),
    );
  };

  const handleCategoryToggle = (categoryId: string) => {
    const current = form.getFieldValue("categories");
    const isSelected = current.includes(categoryId);
    const updated = isSelected
      ? current.filter((id: string) => id !== categoryId)
      : [...current, categoryId];
    form.setFieldValue("categories", updated);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNewProfile ? "Complete Your Profile" : "Edit Profile"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isNewProfile
              ? "Set up your profile to start accepting students"
              : "Manage your public tutor information"}
          </p>
          {lastSaved && (
            <p className="text-xs text-green-600 mt-1">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={loadProfile}
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          {!isNewProfile && (
            <Button variant="outline" asChild>
              <Link href="/dashboard/tutor">Dashboard</Link>
            </Button>
          )}
          <Button
            onClick={() => form.handleSubmit()}
            disabled={isSaving || !form.state.isDirty}
            className="min-w-35"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving
              ? "Saving..."
              : isNewProfile
                ? "Create Profile"
                : "Save Changes"}
          </Button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              This information will be displayed on your public profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.Field name="headline">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="headline">Professional Headline *</Label>
                  <Input
                    id="headline"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., Senior React Developer & CS Tutor"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="bio">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="bio">About Me *</Label>
                  <Textarea
                    id="bio"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Describe your teaching style and experience..."
                    rows={6}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{field.state.value.length} characters</span>
                  </div>
                </div>
              )}
            </form.Field>

            <form.Field name="location">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location *
                  </Label>
                  <Input
                    id="location"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., New York, NY or Remote"
                  />
                </div>
              )}
            </form.Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Professional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field name="hourlyRate">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor="hourlyRate"
                      className="flex items-center gap-2"
                    >
                      <DollarSign className="h-4 w-4" />
                      Hourly Rate (USD) *
                    </Label>
                    <Input
                      id="hourlyRate"
                      name={field.name}
                      type="number"
                      min={1}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="experience">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience *</Label>
                    <Input
                      id="experience"
                      name={field.name}
                      type="number"
                      min={0}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="languages">
              {(field) => (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Languages *
                  </Label>
                  <div className="flex flex-wrap gap-2 min-h-10 p-2 border rounded-md bg-background">
                    {field.state.value.length === 0 && (
                      <span className="text-muted-foreground text-sm py-1">
                        No languages added
                      </span>
                    )}
                    {field.state.value.map((lang: string) => (
                      <Badge
                        key={lang}
                        variant="secondary"
                        className="gap-1 px-3 py-1"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => removeLanguage(lang)}
                          className="ml-1 hover:text-red-500 focus:outline-none"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a language..."
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addLanguage();
                        }
                      }}
                      className="max-w-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addLanguage}
                      disabled={!newLanguage.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </form.Field>

            <form.Field name="categories">
              {(field) => (
                <div className="space-y-3">
                  <Label>Teaching Categories *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((category) => {
                      const isSelected = field.state.value.includes(
                        category.id,
                      );
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleCategoryToggle(category.id)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              {category.name}
                            </span>
                            {isSelected && (
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </form.Field>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4 sticky bottom-4 bg-background/80 backdrop-blur p-4 rounded-lg border shadow-lg md:static md:bg-transparent md:backdrop-blur-none md:p-0 md:shadow-none md:border-0">
          {form.state.isDirty && (
            <span className="text-sm text-orange-600 font-medium">
              Unsaved changes
            </span>
          )}
          <Button
            type="submit"
            disabled={isSaving || !form.state.isDirty}
            className="min-w-35"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isNewProfile ? "Complete Profile" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
