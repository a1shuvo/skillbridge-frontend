import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TutorCard } from "@/components/tutors/tutor-card"
import { get } from "@/lib/api"
import type { TutorProfile } from "@/types"

interface FeaturedTutorsResponse {
  data: (TutorProfile & { 
    user: { 
      name: string | null
      image: string | null 
    } 
  })[]
}

async function getFeaturedTutors(): Promise<FeaturedTutorsResponse> {
  try {
    // Fetch top-rated featured tutors from API
    return await get<FeaturedTutorsResponse>("/api/v1/tutors?limit=6&sortBy=rating&order=desc")
  } catch (error) {
    console.error("Failed to fetch featured tutors:", error)
    return { data: [] }
  }
}

export async function FeaturedTutorsSection() {
  const { data: tutors } = await getFeaturedTutors()

  if (tutors.length === 0) {
    return null // Or show a placeholder/skeleton
  }

  return (
    <section className="py-20 md:py-28">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Featured Tutors
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl">
              Learn from our highest-rated experts across various subjects
            </p>
          </div>
          <Button variant="outline" className="shrink-0" asChild>
            <Link href="/tutors">View All Tutors</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      </div>
    </section>
  )
}