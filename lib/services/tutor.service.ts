import { get, put } from "@/lib/api";
import type {
  ApiResponse,
  AvailabilitySlot,
  Booking,
  TutorProfile,
} from "@/types";

// --- Types ---
export interface TutorDashboardProfile extends Omit<
  TutorProfile,
  "categories"
> {
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
  categories: Array<{
    category: { id: string; name: string };
  }>;
}

export interface TutorSession extends Booking {
  student: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  slot: {
    startTime: string;
    endTime: string;
  } | null;
  review?: {
    rating: number;
    comment: string | null;
  } | null;
}

interface TutorProfileResponse {
  success: boolean;
  data: TutorDashboardProfile;
}

export interface UpdateAvailabilityInput {
  body: {
    slots: {
      startTime: string;
      endTime: string;
    }[];
  };
}

export interface UpdateAvailabilityResponse {
  success: boolean;
  message: string;
}

// --- Service ---
export const tutorService = {
  /**
   * REPLACEMENT FOR GET /ME
   * We use the PUT route with an empty object.
   * Your backend upsert will return the existing profile for the current user.
   */
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
    body: Record<string, string | number | boolean | null>;
  }) {
    return put<ApiResponse<TutorProfile>>("/api/v1/tutors/profile", payload);
  },

  async getTutorById(id: string) {
    // We expect the 'data' property of the response to be a TutorProfile
    return get<ApiResponse<TutorProfile>>(`/api/v1/tutors/${id}`, {
      skipErrorToast: true,
    });
  },

  async getAvailability() {
    return get<ApiResponse<AvailabilitySlot[]>>("/api/v1/tutors/availability", {
      skipErrorToast: true,
    });
  },

  async updateAvailability(data: UpdateAvailabilityInput) {
    // Note: We pass 'data' directly because it already contains the { body } wrapper
    return put<ApiResponse<{ count: number }>>(
      "/api/v1/tutors/availability",
      data,
    );
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

    // Replace <any> with <TutorSession[]>
    return get<ApiResponse<TutorSession[]>>(
      `/api/v1/tutors/bookings${query ? `?${query}` : ""}`,
      {
        skipErrorToast: true,
      },
    );
  },
};
