import { TutorCard } from "@/components/tutors/tutor-card";
import { TutorListSkeleton } from "@/components/tutors/tutor-card-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { tutorService } from "@/lib/services/tutor.service";

interface TutorsListProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function getTutors(searchParams: TutorsListProps["searchParams"]) {
  const filters = {
    search: searchParams.search as string,
    category: searchParams.category as string,
    minRating: searchParams.minRating
      ? Number(searchParams.minRating)
      : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    sortBy: searchParams.sortBy as string,
    page: searchParams.page ? Number(searchParams.page) : 1,
    limit: 9,
  };

  return tutorService.getTutors(filters);
}

export async function TutorsList({ searchParams }: TutorsListProps) {
  const { data: tutors, meta } = await getTutors(searchParams);

  // Build base URL for pagination
  const filterParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "page" && value !== "all") {
      filterParams.set(key, String(value));
    }
  });
  const baseUrl = `/tutors${filterParams.toString() ? `?${filterParams.toString()}` : ""}`;

  if (tutors.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-medium text-muted-foreground mb-2">
          No tutors found
        </p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {tutors.map((tutor) => (
          <TutorCard key={tutor.id} tutor={tutor} />
        ))}
      </div>

      {meta.totalPage > 1 && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPage}
          baseUrl={baseUrl}
        />
      )}

      <p className="text-center text-sm text-muted-foreground mt-4">
        Page {meta.page} of {meta.totalPage} • {meta.total} total tutors
      </p>
    </>
  );
}

// Fixed export name: TutorListSkeleton not TutorsListSkeleton
export function TutorsListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <TutorListSkeleton count={9} />
    </div>
  );
}
