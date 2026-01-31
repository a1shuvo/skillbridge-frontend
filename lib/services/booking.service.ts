import { get, post, patch } from "@/lib/api"
import type { Booking } from "@/types"

interface CreateBookingData {
  tutorId: string
  slotId: string
  note?: string
}

interface BookingResponse {
  success: boolean
  message: string
  data: Booking & {
    slot: {
      id: string
      startTime: string
      endTime: string
      isBooked: boolean
    }
    tutor: {
      name: string | null
      email: string
    }
  }
}

export const bookingService = {
  async createBooking(data: CreateBookingData) {
    return post<BookingResponse>("/api/v1/bookings", data)
  },

  async getMyBookings() {
    return get<{ success: boolean; data: Booking[] }>("/api/v1/bookings")
  },

  async getBookingById(id: string) {
    return get<{ success: boolean; data: Booking }>(`/api/v1/bookings/${id}`)
  },

  async cancelBooking(id: string) {
    return patch<{ success: boolean; data: Booking }>(`/api/v1/bookings/${id}/cancel`, {})
  },
}