// Enums
export type UserRole = "STUDENT" | "TUTOR" | "ADMIN";
export type UserStatus = "ACTIVE" | "BANNED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

// 1. User Interface
export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

// 2. Category Interface
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    tutorCategories: number;
  };
  totalTutors?: number;
}

// 3. Tutor-Category Join Table
export interface TutorCategory {
  id?: string; // Optional depending on if using Prisma ID or composite
  tutorId: string;
  categoryId: string;
  category: Category;
}

// 4. Availability Slot
export interface AvailabilitySlot {
  id: string;
  tutorId: string;
  startTime: string; // ISO String
  endTime: string;
  isBooked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 5. Review Interface
export interface Review {
  id: string;
  bookingId?: string;
  studentId: string;
  tutorProfileId?: string;
  rating: number;
  comment: string | null; // Unified to allow null
  student: {
    id: string;
    name: string | null;
    image: string | null;
  };
  createdAt: string;
  updatedAt?: string;
}

// 6. Tutor Profile Interface
export interface TutorProfile {
  id: string;
  userId: string;
  bio: string | null;
  headline: string | null;
  location: string | null;
  languages?: string[]; // Kept as optional array
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
  // Merged the two user declarations into one required object
  user: {
    name: string | null;
    email?: string; // Optional in case of public views
    image: string | null;
  };
}

// 7. Booking Interface
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

// 8. API Response Helpers
export interface ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}