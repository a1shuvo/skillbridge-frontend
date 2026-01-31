
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Computer Science Student",
    image: "/avatars/student1.jpg",
    content: "My tutor helped me go from failing calculus to getting an A. The personalized attention made all the difference.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "High School Junior",
    image: "/avatars/student2.jpg",
    content: "I've tried other platforms, but SkillBridge has the most qualified tutors. The booking system is seamless.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Medical Student",
    image: "/avatars/student3.jpg",
    content: "The flexibility to schedule sessions around my busy schedule is a game-changer. Highly recommend!",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Trusted by{" "}
            <span className="text-primary">10,000+ Students</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See what students are saying about their learning experience on SkillBridge.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-muted/50">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">&quot;{testimonial.content}&quot;</p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}