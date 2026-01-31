import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageSquare, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description:
      "Book sessions that fit your schedule. Choose from real-time available slots and reschedule with ease.",
  },
  {
    icon: Shield,
    title: "Verified Experts",
    description:
      "All tutors are thoroughly vetted with background checks. Learn from certified professionals with proven track records.",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description:
      "Chat directly with tutors before booking. Discuss your goals, curriculum, and learning preferences upfront.",
  },
  {
    icon: Zap,
    title: "Instant Confirmation",
    description:
      "Real-time booking system with immediate confirmation. No waiting periods or back-and-forth emails.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-10 md:py-12 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Why Choose SkillBridge?
          </h2>
          <p className="mx-auto max-w-150 text-muted-foreground text-lg md:text-xl">
            Everything you need for a seamless learning experience, all in one
            platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border bg-background/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
