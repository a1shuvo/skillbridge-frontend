"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { BookOpen, Clock, Home, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role?: string;
}

interface StudentSidebarProps {
  user: SessionUser;
}

const sidebarNavItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard/student",
  },
  {
    title: "My Bookings",
    icon: Clock,
    href: "/dashboard/student/bookings",
  },
  {
    title: "Profile",
    icon: User,
    href: "/dashboard/student/profile",
  },
];

export function StudentSidebar({ user }: StudentSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <div className="hidden border-r bg-background lg:block lg:w-64">
      <div className="flex h-full flex-col">
        {/* Logo Header */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard/student" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Skill Bridge</span>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="grid gap-1 px-4">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      isActive && "bg-secondary",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer - User Info & Logout */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.image || ""} alt={user.name} />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">
                {user.name}
              </span>
              <span className="text-xs text-muted-foreground mt-1 truncate max-w-35">
                {user.email}
              </span>
            </div>
          </div>

          <Separator className="mb-3" />

          <div className="grid gap-1">
            <Link href="/dashboard/student/settings">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
