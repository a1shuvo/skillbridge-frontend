// Enums
export type UserRole = "STUDENT" | "TUTOR" | "ADMIN";
export type UserStatus = "ACTIVE" | "BANNED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

// User
export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    tutorCategories: number;
  };
  totalTutors?: number;
}

// Tutor Profile
export interface TutorCategory {
  id: string;
  tutorId: string;
  categoryId: string;
  category: Category;
}

export interface TutorProfile {
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
  categories: TutorCategory[];
  availability?: AvailabilitySlot[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string | null;
    image: string | null;
  };
}

export interface AvailabilitySlot {
  id: string;
  tutorId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  createdAt: string;
  updatedAt: string;
}

// Booking
export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  slotId: string | null;
  status: BookingStatus;
  note: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Review
export interface Review {
  id: string;
  bookingId: string;
  studentId: string;
  tutorProfileId: string;
  rating: number;
  comment: string | null;
  student: {
    id: string;
    name: string | null;
    image: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

// API Meta
export interface ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPage: number;
}

// Generic API Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}
