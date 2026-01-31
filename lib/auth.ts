import type { UserRole, UserStatus, User as UserType } from "@/types/index";
import { createAuthClient } from "better-auth/client";

export type AuthUser = UserType;
export type { UserRole, UserStatus };

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;

export function toAuthUser(data: unknown): UserType {
  return data as UserType;
}

export function hasRole(user: UserType | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function isActive(user: UserType | null): boolean {
  if (!user) return false;
  return user.status === "ACTIVE";
}

export const ROLE_ROUTES: Record<UserRole, string> = {
  STUDENT: "/student/dashboard",
  TUTOR: "/tutor/dashboard",
  ADMIN: "/admin/dashboard",
};
