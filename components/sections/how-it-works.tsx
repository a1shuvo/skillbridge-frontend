// app/sections/HowItWorksSection.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Search, Trophy, Video } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find Your Tutor",
    description:
      "Browse verified tutors by subject, expertise, and reviews. Filter by price, availability, and teaching style.",
  },
  {
    icon: Calendar,
    title: "Book a Session",
    description:
      "Choose a time that works for you. Instantly book available slots or request a custom time.",
  },
  {
    icon: Video,
    title: "Start Learning",
    description:
      "Join interactive video sessions with screen sharing, digital whiteboard, and recording capabilities.",
  },
  {
    icon: Trophy,
    title: "Track Progress",
    description:
      "Review session recordings, track your improvement, and achieve your learning goals faster.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Start Learning in <span className="text-primary">4 Easy Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            SkillBridge makes it simple to connect with expert tutors and begin
            your learning journey today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <Card
              key={step.title}
              className="relative bg-background border-2 border-muted hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-sm font-medium text-primary mb-2">
                  Step {index + 1}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
