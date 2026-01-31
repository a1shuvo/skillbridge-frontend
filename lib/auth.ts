import { createAuthClient } from "better-auth/client"

// Client-side auth instance
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
})

// Export hooks and methods
export const { 
  signIn, 
  signOut, 
  signUp, 
  useSession,
  getSession 
} = authClient

// Export helper for server components
export const auth = {
  getSession: async () => {
    // For server components, we'll use the client method
    // In a real app, you might want to use cookies/session directly
    return authClient.getSession()
  }
}

// Types
export type User = typeof authClient.$Infer.Session.user
export type Session = typeof authClient.$Infer.Session.session