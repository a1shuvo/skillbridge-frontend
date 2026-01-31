"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { TutorSidebar } from "@/components/tutors/tutor-sidebar";
import { Loader2 } from "lucide-react";

// Define the session user type based on Better Auth response
interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role?: string;
  status?: string;
}

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession();
        if (session?.data?.user) {
          setUser(session.data.user as SessionUser);
        }
      } catch {
        setUser(null);
      } finally {
        setIsPending(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isPending && (!user || user.role !== "TUTOR")) {
      router.push("/login");
    }
  }, [user, isPending, router]);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "TUTOR") {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <TutorSidebar user={user} />
      <main className="flex-1 p-8 bg-muted/30 overflow-y-auto">{children}</main>
    </div>
  );
}