import { Navbar } from "@/components/layout/navbar";
import { TutorFilters } from "@/components/tutors/filters";
import { MobileFilters } from "@/components/tutors/mobile-filters";
import {
  TutorsList,
  TutorsListSkeleton,
} from "@/components/tutors/tutors-list";
import { categoryService } from "@/lib/services/category.service";
import { tutorService } from "@/lib/services/tutor.service";
import type { Category } from "@/types";
import { Suspense } from "react";

interface TutorsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await categoryService.getAllCategories();
    return res.data;
  } catch {
    return [];
  }
}

async function getMaxPrice(): Promise<number> {
  try {
    const res = await tutorService.getTutors({
      sortBy: "price_high",
      limit: 1,
    });
    const maxTutor = res.data[0];
    return maxTutor ? Math.ceil(maxTutor.hourlyRate / 100) * 100 : 2000;
  } catch {
    return 2000;
  }
}

export default async function TutorsPage({ searchParams }: TutorsPageProps) {
  const resolvedSearchParams = await searchParams;
  const categories = await getCategories();
  const maxPrice = await getMaxPrice();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background">
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Find Your Perfect Tutor
            </h1>
            <p className="text-muted-foreground text-lg">
              Browse verified experts and book personalized learning sessions
            </p>
          </div>

          <div className="lg:hidden mb-6">
            <MobileFilters categories={categories} maxPriceFromDb={maxPrice} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="hidden lg:block">
              <TutorFilters categories={categories} maxPriceFromDb={maxPrice} />
            </aside>

            <div className="lg:col-span-3">
              <Suspense fallback={<TutorsListSkeleton />}>
                <TutorsList searchParams={resolvedSearchParams} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
