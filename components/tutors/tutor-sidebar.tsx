import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Calendar, Clock, LayoutDashboard, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  { href: "/dashboard/tutor", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/tutor/bookings", label: "My Sessions", icon: Calendar }, // Added bookings
  { href: "/dashboard/tutor/availability", label: "Availability", icon: Clock },
  { href: "/dashboard/tutor/profile", label: "Profile", icon: User },
];

export function TutorSidebar({ user }: TutorSidebarProps) {
  const pathname = usePathname();

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
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            {user.name?.[0] || "T"}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user.name || "Tutor"}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
