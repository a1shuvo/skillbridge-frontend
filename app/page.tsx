import { Navbar } from "@/components/layout/navbar";
import { FeaturedTutorsSection } from "@/components/sections/featured-tutors";
import { FeaturesSection } from "@/components/sections/features";
import { HeroSection } from "@/components/sections/hero";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <FeaturedTutorsSection />
      </main>
    </div>
  );
}
