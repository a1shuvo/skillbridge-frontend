import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/sections/hero";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        {/* Next sections will go here */}
      </main>
    </div>
  );
}
