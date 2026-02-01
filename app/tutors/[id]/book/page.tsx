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
    const cookieStore = await cookies();
    const token = cookieStore.get("better-auth.session_token")?.value;
    if (!token) return null;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`,
      {
        headers: { Cookie: `better-auth.session_token=${token}` },
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

  // Hard redirect only for auth (must login)
  if (!user) {
    const returnUrl = encodeURIComponent(
      `/tutors/${id}/book${slotId ? `?slot=${slotId}` : ""}`,
    );
    redirect(`/login?returnUrl=${returnUrl}`);
  }

  // Initialize variables
  let errorMessage: string | null = null;
  let tutor = null;
  let slot = null;

  // Validation checks
  if (user.role !== "STUDENT") {
    errorMessage = "Only students can book tutoring sessions";
  } else if (!slotId) {
    errorMessage = "Please select a time slot";
  } else {
    // Fetch tutor
    try {
      const res = await tutorService.getTutorById(id);
      tutor = res.data;
    } catch {
      errorMessage = "Tutor not found";
    }

    // Verify slot if tutor found
    if (tutor && !errorMessage) {
      slot = tutor.availability?.find(
        (s: AvailabilitySlot) => s.id === slotId && !s.isBooked,
      );
      if (!slot) {
        errorMessage = "This slot is no longer available";
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20 py-8 md:py-12">
        <div className="container px-4 md:px-6 max-w-2xl">
          <BookingForm
            tutor={tutor}
            slot={slot || null}
            initialError={errorMessage}
          />
        </div>
      </main>
    </div>
  );
}
