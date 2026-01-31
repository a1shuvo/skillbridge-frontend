import { get, patch, post } from "@/lib/api";
import type { Booking } from "@/types";

interface BookingsResponse {
  success: boolean;
  data: Booking[];
  meta?: {
    total: number;
    page: number;
    totalPage: number;
  };
}

interface CreateBookingData {
  tutorId: string;
  slotId: string;
  note?: string;
}

export const bookingService = {
  async getMyBookings() {
    return get<BookingsResponse>("/api/v1/bookings", { skipErrorToast: true });
  },

  async getBookingById(id: string) {
    return get<{ success: boolean; data: Booking }>(`/api/v1/bookings/${id}`, {
      skipErrorToast: true,
    });
  },

  async createBooking(data: CreateBookingData) {
    return post<{ success: boolean; data: Booking; clientSecret: string }>(
      "/api/v1/bookings",
      data,
    );
  },

  async cancelBooking(id: string) {
    return patch<{ success: boolean; data: Booking }>(
      `/api/v1/bookings/${id}/cancel`,
      {},
    );
  },

  async completeBooking(id: string) {
    return patch<{ success: boolean; data: Booking }>(
      `/api/v1/bookings/${id}/complete`,
      {},
    );
  },
};
