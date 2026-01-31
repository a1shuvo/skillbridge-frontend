import { createAuthClient } from "better-auth/client"

// User roles matching Prisma schema
export type UserRole = "STUDENT" | "TUTOR" | "ADMIN"
export type UserStatus = "ACTIVE" | "BANNED"

// Extended user type with custom fields from Prisma
export interface AuthUser {
  id: string
  name: string | null
  email: string
  emailVerified: boolean
  image: string | null
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
}

// Auth session with extended user
export interface AuthSession {
  token: string | null
  user: AuthUser
  session?: {
    id: string
    expiresAt: Date
    token: string
  }
}

// Create auth client
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
})

// Export auth methods
export const { 
  signIn, 
  signOut, 
  signUp, 
  useSession,
  getSession 
} = authClient

// Cast unknown data to AuthUser (for API responses)
export function toAuthUser(data: unknown): AuthUser {
  return data as AuthUser
}

// Helper to check user role
export function hasRole(user: AuthUser | null, roles: UserRole[]): boolean {
  if (!user) return false
  return roles.includes(user.role)
}

// Helper to check if user is active
export function isActive(user: AuthUser | null): boolean {
  if (!user) return false
  return user.status === "ACTIVE"
}

// Role-based routes
export const ROLE_ROUTES: Record<UserRole, string> = {
  STUDENT: "/student/dashboard",
  TUTOR: "/tutor/dashboard",
  ADMIN: "/admin/dashboard",
}