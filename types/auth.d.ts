import "better-auth/client"
import type { UserRole } from "./index"

declare module "better-auth/client" {
  interface RegisterEmailInput {
    role?: UserRole
  }
  
  interface SignInEmailInput {
    rememberMe?: boolean
  }
}