import Link from "next/link"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { TutorProfile } from "@/types"

interface TutorCardProps {
  tutor: TutorProfile & { user?: { name: string | null; image?: string | null } }
}

export function TutorCard({ tutor }: TutorCardProps) {
  const displayName = tutor.user?.name || "Anonymous Tutor"
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
  
  return (
    <Card className="overflow-hidden border bg-background hover:shadow-md transition-all h-full flex flex-col">
      <CardContent className="p-4 flex flex-col h-full">
        {/* Top Row: Avatar | Name/Headline | PRICE */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border shrink-0">
              <AvatarImage src={tutor.user?.image || ""} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate leading-tight">
                {displayName}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {tutor.headline || "Tutor"}
              </p>
            </div>
          </div>

          {/* PRICE - Fixed width, always visible */}
          <div className="bg-primary/5 px-2 py-1 rounded-lg text-center shrink-0 ml-2">
            <div className="font-bold text-primary text-base sm:text-lg leading-none">
              ${tutor.hourlyRate}
            </div>
            <div className="text-[10px] text-muted-foreground font-medium">
              /hr
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-auto">
          {tutor.bio || "No description available"}
        </p>

        {/* Rating Row */}
        <div className="flex items-center gap-1 mt-3 mb-2">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{tutor.avgRating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({tutor.totalReviews})</span>
          {tutor.isVerified && (
            <Badge variant="outline" className="ml-auto text-[10px] h-5 px-1.5">
              Verified
            </Badge>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-3">
          {tutor.categories.slice(0, 2).map((tc) => (
            <Badge key={tc.categoryId} variant="secondary" className="text-[10px] font-normal">
              {tc.category.name}
            </Badge>
          ))}
          {tutor.categories.length > 2 && (
            <Badge variant="secondary" className="text-[10px] font-normal">
              +{tutor.categories.length - 2}
            </Badge>
          )}
        </div>

        {/* Button */}
        <Button className="w-full mt-auto" size="sm" asChild>
          <Link href={`/tutors/${tutor.id}`}>View Profile</Link>
        </Button>
      </CardContent>
    </Card>
  )
}