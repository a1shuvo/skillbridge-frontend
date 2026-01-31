import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { TutorProfile } from "@/types";
import { Star } from "lucide-react";
import Link from "next/link";

interface TutorCardProps {
  tutor: TutorProfile & { user?: { name: string; image?: string | null } };
}

export function TutorCard({ tutor }: TutorCardProps) {
  const displayName = tutor.user?.name || "Anonymous Tutor";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="overflow-hidden border bg-background hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarImage
                src={tutor.user?.image || undefined}
                alt={displayName}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{displayName}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {tutor.headline || "Expert Tutor"}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-lg text-primary">
              ${tutor.hourlyRate}
            </p>
            <p className="text-xs text-muted-foreground">per hour</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {tutor.bio || "No description available"}
        </p>

        <div className="flex items-center gap-1 mb-4">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium text-sm">
            {tutor.avgRating.toFixed(1)}
          </span>
          <span className="text-muted-foreground text-sm">
            ({tutor.totalReviews} reviews)
          </span>
          {tutor.isVerified && (
            <Badge variant="secondary" className="ml-auto text-xs">
              Verified
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {tutor.categories.slice(0, 3).map((tc) => (
            <Badge key={tc.categoryId} variant="outline" className="text-xs">
              {tc.category.name}
            </Badge>
          ))}
          {tutor.categories.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tutor.categories.length - 3}
            </Badge>
          )}
        </div>

        <Button className="w-full mt-auto" asChild>
          <Link href={`/tutors/${tutor.id}`}>View Profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
