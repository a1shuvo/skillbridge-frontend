import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, Search } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-primary/5 via-background to-background pt-16 pb-24 md:pt-24 md:pb-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Master Any Skill with{" "}
              <span className="text-primary">Expert Tutors</span>
            </h1>
            <p className="mx-auto max-w-175 text-muted-foreground text-lg md:text-xl leading-relaxed">
              Connect with verified tutors in any subject. Book personalized
              sessions, learn at your own pace, and achieve your goals with
              1-on-1 guidance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button size="lg" className="gap-2 text-base" asChild>
              <Link href="/tutors">
                <Search className="h-4 w-4" />
                Find a Tutor
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-base"
              asChild
            >
              <Link href="/register?role=tutor">
                <GraduationCap className="h-4 w-4" />
                Become a Tutor
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="pt-8 flex items-center justify-center gap-8 md:gap-12 text-sm text-muted-foreground flex-wrap">
            <div className="flex flex-col items-center gap-1">
              <span className="font-bold text-2xl md:text-3xl text-foreground">
                500+
              </span>
              <span className="text-xs md:text-sm">Expert Tutors</span>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-bold text-2xl md:text-3xl text-foreground">
                10k+
              </span>
              <span className="text-xs md:text-sm">Active Students</span>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-bold text-2xl md:text-3xl text-foreground">
                50+
              </span>
              <span className="text-xs md:text-sm">Subjects</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
