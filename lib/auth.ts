import type { UserRole, UserStatus, User as UserType } from "@/types/index";
import { createAuthClient } from "better-auth/client";

export type AuthUser = UserType;
export type { UserRole, UserStatus };

// Client-side auth instance (for Browser/Client Components only)
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
});

// Export client hooks and methods
export const { signIn, signOut, signUp, useSession, getSession } = authClient;

// Helper to safely cast API responses to User type
export function toAuthUser(data: unknown): UserType {
  return data as UserType;
}

// Role checking utilities
export function hasRole(user: UserType | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function isActive(user: UserType | null): boolean {
  if (!user) return false;
  return user.status === "ACTIVE";
}

// Role-based redirect routes
export const ROLE_ROUTES: Record<UserRole, string> = {
  STUDENT: "/dashboard/student",
  TUTOR: "/dashboard/tutor",
  ADMIN: "/dashboard/admin",
};
