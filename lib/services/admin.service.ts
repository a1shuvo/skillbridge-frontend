import { get, patch, post, del } from "@/lib/api";
import type { ApiMeta, Booking, User } from "@/types";

// Dashboard Stats - Matches your backend response exactly
export interface DashboardStats {
  users: {
    totalStudents: number;
    totalTutors: number;
    verifiedTutors: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    totalRevenue: number;
  };
}

// Users - Matches your backend select fields
export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: "STUDENT" | "TUTOR" | "ADMIN";
  status: "ACTIVE" | "BANNED";
  createdAt: string;
  tutorProfile: {
    isVerified: boolean;
    avgRating: number;
  } | null;
}

interface UsersResponse {
  success: boolean;
  data: AdminUser[];
  meta?: ApiMeta;
}

// Bookings
export interface AdminBooking extends Booking {
  student: {
    name: string | null;
    email: string;
  };
  tutor: {
    name: string | null;
    email: string;
  };
  slot: {
    id?: string;
    startTime: string;
    endTime: string;
    subject?: string | null;
  } | null;
  review: {
    id?: string;
    rating: number;
    comment: string | null;
  } | null;
}

interface BookingsResponse {
  success: boolean;
  data: AdminBooking[];
  meta?: ApiMeta;
}

// Categories
export interface Category {
  id: string;
  name: string;
  slug: string;
  totalTutors: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesResponse {
  success: boolean;
  data: Category[];
  message?: string;
}

interface CategoryResponse {
  success: boolean;
  data: Category;
  message?: string;
}

export const adminService = {
  // Get dashboard statistics
  async getDashboardStats() {
    return get<{ success: boolean; data: DashboardStats }>(
      "/api/v1/admin/stats",
      {
        skipErrorToast: true,
      },
    );
  },

  // Get all users
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", String(params.page));
    if (params?.limit) queryParams.set("limit", String(params.limit));
    if (params?.role && params.role !== "ALL")
      queryParams.set("role", params.role);
    if (params?.status && params.status !== "ALL")
      queryParams.set("status", params.status);

    const query = queryParams.toString();
    return get<UsersResponse>(`/api/v1/admin/users${query ? `?${query}` : ""}`);
  },

  // Update user status (ban/unban) or verify tutor
  async updateUser(
    userId: string,
    payload: { status?: "ACTIVE" | "BANNED"; isVerified?: boolean },
  ) {
    return patch<{ success: boolean; message: string; data: User }>(
      `/api/v1/admin/users/${userId}`,
      payload,
    );
  },

  // Get all bookings
  async getAllBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", String(params.page));
    if (params?.limit) queryParams.set("limit", String(params.limit));
    if (params?.status && params.status !== "ALL")
      queryParams.set("status", params.status);

    const query = queryParams.toString();
    return get<BookingsResponse>(
      `/api/v1/admin/bookings${query ? `?${query}` : ""}`,
    );
  },

  // Get all categories
  async getAllCategories() {
    return get<CategoriesResponse>("/api/v1/categories");
  },

  // Create category
  async createCategory(name: string) {
    return post<CategoryResponse>("/api/v1/categories", { name });
  },

  // Update category
  async updateCategory(id: string, name: string) {
    return patch<CategoryResponse>(`/api/v1/categories/${id}`, { name });
  },

  // Delete category
  async deleteCategory(id: string) {
    return del<{ success: boolean; message: string }>(`/api/v1/categories/${id}`);
  },
};