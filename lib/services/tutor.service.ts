import { get, put } from "@/lib/api";
import type { ApiResponse, AvailabilitySlot } from "@/types";

// --- Types ---

// Public tutor list item
interface TutorListItem {
  id: string;
  userId: string;
  bio: string | null;
  headline: string | null;
  location: string | null;
  languages: string[];
  hourlyRate: number;
  experience: number;
  isVerified: boolean;
  avgRating: number;
  totalReviews: number;
  totalSessions: number;
  user: {
    name: string | null;
    image: string | null;
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface TutorsResponse {
  success: boolean;
  data: TutorListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

// Detailed tutor view (public single tutor)
interface TutorDetailItem {
  id: string;
  userId: string;
  bio: string | null;
  headline: string | null;
  location: string | null;
  languages: string[];
  hourlyRate: number;
  experience: number;
  isVerified: boolean;
  avgRating: number;
  totalReviews: number;
  totalSessions: number;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string | null;
    image: string | null;
    email: string;
  };
  categories: Array<{
    id: string;
    tutorId: string;
    categoryId: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  reviews: Array<{
    id: string;
    bookingId: string;
    studentId: string;
    tutorProfileId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    student: {
      id: string; // Added
      name: string | null;
      image: string | null;
    };
  }>;
  availability: AvailabilitySlot[];
}

// Dashboard profile (current tutor view)
interface TutorDashboardProfile {
  id: string;
  userId: string;
  bio: string | null;
  headline: string | null;
  location: string | null;
  languages: string[];
  hourlyRate: number;
  experience: number;
  isVerified: boolean;
  avgRating: number;
  totalReviews: number;
  totalSessions: number;
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
  availability: AvailabilitySlot[];
  reviews: Array<{
    id: string;
    bookingId: string;
    studentId: string;
    tutorProfileId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    student: {
      name: string | null;
      image: string | null;
    };
  }>;
}

interface TutorProfileResponse {
  success: boolean;
  data: TutorDashboardProfile;
}

export interface TutorSession {
  id: string;
  studentId: string;
  tutorId: string;
  slotId: string | null;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  note: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  slot: {
    id: string;
    startTime: string;
    endTime: string;
  } | null;
  student: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  review?: {
    rating: number;
    comment: string | null;
  } | null;
}

export interface UpdateAvailabilityInput {
  slots: {
    startTime: string;
    endTime: string;
  }[];
}

export interface UpdateAvailabilityResponse {
  success: boolean;
  message: string;
  data: { count: number };
}

interface GetTutorsParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_low" | "price_high" | "rating";
  page?: number;
  limit?: number;
}

// --- Service ---
export const tutorService = {
  async getTutors(params: GetTutorsParams = {}) {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.set("search", params.search);
    if (params.category) queryParams.set("category", params.category);
    if (params.minPrice !== undefined)
      queryParams.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined)
      queryParams.set("maxPrice", String(params.maxPrice));
    if (params.sortBy) queryParams.set("sortBy", params.sortBy);
    if (params.page) queryParams.set("page", String(params.page));
    if (params.limit) queryParams.set("limit", String(params.limit));

    const query = queryParams.toString();
    return get<TutorsResponse>(`/api/v1/tutors${query ? `?${query}` : ""}`, {
      skipErrorToast: true,
    });
  },

  async getTutorById(id: string) {
    return get<ApiResponse<TutorDetailItem>>(`/api/v1/tutors/${id}`, {
      skipErrorToast: true,
    });
  },

  async getMyProfile() {
    return put<TutorProfileResponse>(
      "/api/v1/tutors/profile",
      {},
      {
        skipErrorToast: true,
      },
    );
  },

  async updateProfile(payload: {
    headline?: string;
    bio?: string;
    location?: string;
    hourlyRate?: number;
    experience?: number;
    languages?: string[];
    categories?: string[];
  }) {
    return put<ApiResponse<TutorDashboardProfile>>(
      "/api/v1/tutors/profile",
      payload,
    );
  },

  async updateAvailability(data: UpdateAvailabilityInput) {
    return put<UpdateAvailabilityResponse>("/api/v1/tutors/availability", data);
  },

  async getMyBookings(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status && params.status !== "ALL")
      queryParams.set("status", params.status);
    if (params?.page) queryParams.set("page", String(params.page));
    if (params?.limit) queryParams.set("limit", String(params.limit));

    const query = queryParams.toString();

    return get<ApiResponse<TutorSession[]>>(
      `/api/v1/bookings${query ? `?${query}` : ""}`,
      {
        skipErrorToast: true,
      },
    );
  },
};
