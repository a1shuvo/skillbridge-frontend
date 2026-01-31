import { get } from "@/lib/api";
import type { ApiMeta, Review, TutorProfile } from "@/types";

export interface TutorFilters {
  search?: string;
  category?: string;
  minRating?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

interface TutorsResponse {
  success: boolean;
  data: (TutorProfile & {
    user: {
      name: string | null;
      image: string | null;
    };
  })[];
  meta: ApiMeta;
}

interface TutorDetailResponse {
  success: boolean;
  data: TutorProfile & {
    user: {
      name: string | null;
      image: string | null;
      email: string;
    };
    reviews: Review[];
    availability: Array<{
      id: string;
      startTime: string;
      endTime: string;
      isBooked: boolean;
    }>;
  };
}

export const tutorService = {
  async getTutors(filters: TutorFilters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "all" &&
        value !== ""
      ) {
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();
    const url = queryString
      ? `/api/v1/tutors?${queryString}`
      : "/api/v1/tutors";

    return get<TutorsResponse>(url, { skipErrorToast: true });
  },

  async getTutorById(id: string) {
    return get<TutorDetailResponse>(`/api/v1/tutors/${id}`, {
      skipErrorToast: true,
    });
  },
};
