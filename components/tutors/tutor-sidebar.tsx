"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  Clock,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface TutorSidebarProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
    role?: string;
  };
}

const navItems = [
  { href: "/dashboard/tutor", label: "Overview", icon: BarChart3 },
  { href: "/dashboard/tutor/bookings", label: "My Sessions", icon: Calendar },
  { href: "/dashboard/tutor/availability", label: "Availability", icon: Clock },
  { href: "/dashboard/tutor/profile", label: "Profile", icon: User },
  { href: "/dashboard/tutor/settings", label: "Settings", icon: Settings },
];

export function TutorSidebar({ user }: TutorSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            router.push("/login");
            router.refresh(); // Clear cached data
          },
          onError: (ctx) => {
            toast.error(ctx.error?.message || "Failed to sign out");
            setIsSigningOut(false);
          },
        },
      });
    } catch {
      toast.error("An unexpected error occurred");
      setIsSigningOut(false);
    }
  };

  return (
    <aside className="w-64 bg-card border-r min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Tutor Portal</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {user.name || user.email}
        </p>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="pt-6 border-t space-y-4">
        <div className="flex items-center gap-3 px-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ""} alt={user.name || "Tutor"} />
            <AvatarFallback>{user.name?.[0] || "T"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">
              {user.name || "Tutor"}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user.email}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {isSigningOut ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </aside>
  );
}
