import { get } from "@/lib/api"
import type { TutorProfile, ApiMeta } from "@/types"

export interface TutorFilters {
  search?: string
  category?: string
  minRating?: number
  maxPrice?: number
  sortBy?: string
  page?: number
  limit?: number
}

interface TutorsResponse {
  success: boolean
  data: (TutorProfile & { 
    user: { 
      name: string | null
      image: string | null 
    } 
  })[]
  meta: ApiMeta
}

export const tutorService = {
  async getTutors(filters: TutorFilters = {}) {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "all" && value !== "") {
        // URLSearchParams handles encoding automatically
        params.set(key, String(value))
      }
    })
    
    const queryString = params.toString()
    const url = queryString ? `/api/v1/tutors?${queryString}` : "/api/v1/tutors"
    
    console.log("Fetching tutors URL:", url) // Debug log to verify encoding
    
    return get<TutorsResponse>(url, { skipErrorToast: true })
  },

  async getTutorById(id: string) {
    return get<{
      success: boolean
      data: TutorProfile & { 
        user: { 
          name: string | null
          image: string | null 
        } 
      }
    }>(`/api/v1/tutors/${id}`, { skipErrorToast: true })
  },
}