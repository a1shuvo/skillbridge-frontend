import { BookingForm } from "@/components/booking/booking-form";
import { Navbar } from "@/components/layout/navbar";
import { tutorService } from "@/lib/services/tutor.service";
import type { AvailabilitySlot, User } from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface BookPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ slot?: string }>;
}

async function getCurrentUser(): Promise<User | null> {
  try {
    // Check for auth cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("better-auth.session_token")?.value;

    if (!token) return null;

    // Fetch user from API using the token
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`,
      {
        headers: {
          Cookie: `better-auth.session_token=${token}`,
        },
        credentials: "include",
      },
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export default async function BookPage({
  params,
  searchParams,
}: BookPageProps) {
  const { id } = await params;
  const { slot: slotId } = await searchParams;
  const user = await getCurrentUser();

  // Redirect to login if not authenticated
  if (!user) {
    const returnUrl = encodeURIComponent(
      `/tutors/${id}/book${slotId ? `?slot=${slotId}` : ""}`,
    );
    redirect(`/login?returnUrl=${returnUrl}`);
  }

  // Check if user is a student
  if (user.role !== "STUDENT") {
    redirect(`/tutors/${id}?error=only_students_can_book`);
  }

  // Validate slot exists
  if (!slotId) {
    redirect(`/tutors/${id}?error=no_slot_selected`);
  }

  // Fetch tutor details
  let tutor;
  try {
    const res = await tutorService.getTutorById(id);
    tutor = res.data;
  } catch {
    redirect(`/tutors?error=tutor_not_found`);
  }

  // Verify slot exists and belongs to this tutor
  const slot = tutor.availability?.find(
    (s: AvailabilitySlot) => s.id === slotId && !s.isBooked,
  );
  if (!slot) {
    redirect(`/tutors/${id}?error=slot_not_available`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20 py-8 md:py-12">
        <div className="container px-4 md:px-6 max-w-2xl">
          <BookingForm tutor={tutor} slot={slot} user={user} />
        </div>
      </main>
    </div>
  );
}
