"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Calendar,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard/admin/categories", label: "Categories", icon: Tag },
];

interface AdminSidebarProps {
  user: {
    id?: string;
    name?: string | null;
    email: string;
    role?: string;
    image?: string | null;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-background border-r flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b">
        <Link
          href="/dashboard/admin"
          className="flex items-center gap-2 font-bold text-xl"
        >
          <GraduationCap className="h-6 w-6 text-primary" />
          Admin Panel
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-4">
        <div className="px-4 py-2">
          <p className="text-sm font-medium truncate">{user.name || "Admin"}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
