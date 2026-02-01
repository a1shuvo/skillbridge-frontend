import { Navbar } from "@/components/layout/navbar";
import { TutorProfile } from "@/components/tutors/tutor-profile";
import { TutorProfileSkeleton } from "@/components/tutors/tutor-profile-skeleton";
import { tutorService } from "@/lib/services/tutor.service";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface TutorPageProps {
  params: Promise<{ id: string }>;
}

async function getTutor(id: string) {
  try {
    const res = await tutorService.getTutorById(id);
    return res.data;
  } catch {
    return null;
  }
}

export default async function TutorPage({ params }: TutorPageProps) {
  const { id } = await params;
  const tutor = await getTutor(id);

  if (!tutor || !tutor.user?.email) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20">
        <Suspense fallback={<TutorProfileSkeleton />}>
          <TutorProfile tutor={tutor} />
        </Suspense>
      </main>
    </div>
  );
}
