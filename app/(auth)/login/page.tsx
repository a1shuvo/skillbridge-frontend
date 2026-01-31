import Link from "next/link"
import { LoginForm } from "@/components/forms/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto px-4 py-4">
        <Link href="/" className="text-2xl font-bold flex items-center gap-2">
          <span className="bg-primary text-primary-foreground px-2 py-1 rounded">SB</span>
          SkillBridge
        </Link>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <LoginForm />
      </main>
    </div>
  )
}