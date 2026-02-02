import { TutorCard } from "@/components/tutors/tutor-card";
import { TutorListSkeleton } from "@/components/tutors/tutor-card-skeleton";
import { Button } from "@/components/ui/button";
import { get } from "@/lib/api";
import type { TutorProfile } from "@/types";
import Link from "next/link";
import { Suspense } from "react";

interface FeaturedTutorsResponse {
  data: (TutorProfile & {
    user: {
      name: string | null;
      image: string | null;
    };
  })[];
}

async function getFeaturedTutors(): Promise<FeaturedTutorsResponse> {
  try {
    // Fetch top-rated tutors
    return await get<FeaturedTutorsResponse>(
      "/api/v1/tutors?limit=6&sortBy=rating&order=desc",
      {
        skipErrorToast: true,
      },
    );
  } catch {
    return { data: [] };
  }
}

async function TutorsList() {
  const { data: tutors } = await getFeaturedTutors();

  if (tutors.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          No tutors available
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Check back soon for our expert tutors
        </p>
        <Button variant="outline" asChild>
          <Link href="/tutors">Browse All Tutors</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tutors.map((tutor) => (
        <TutorCard key={tutor.id} tutor={tutor} />
      ))}
    </div>
  );
}

export function FeaturedTutorsSection() {
  return (
    <section className="py-20 md:py-28 bg-muted/20">
      <div className="container px-4 md:px-6">
        {/* Centered Title Section */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Featured Tutors
          </h2>
          <p className="mx-auto max-w-150 text-muted-foreground text-lg md:text-xl">
            Learn from our highest-rated experts across various subjects
          </p>
        </div>

        {/* Tutors Grid with Suspense */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TutorListSkeleton count={3} />
            </div>
          }
        >
          <TutorsList />
        </Suspense>

        {/* View All Button - Centered */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link href="/tutors">View All Tutors</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
