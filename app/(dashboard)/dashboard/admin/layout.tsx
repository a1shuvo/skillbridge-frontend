"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { get } from "@/lib/api";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Loader2 } from "lucide-react";
import type { User } from "@/types";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await get<{ success: boolean; data: User }>("/api/v1/auth/me", {
          skipErrorToast: true,
        });
        setUser(response.data);
      } catch {
        setUser(null);
      } finally {
        setIsPending(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isPending && (!user || user.role !== "ADMIN")) {
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

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={user} />
      <main className="flex-1 p-8 bg-muted/30 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}