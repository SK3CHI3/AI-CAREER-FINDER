import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

const testimonials = [
  // STUDENT - different schools
  {
    name: "Amina Hassan",
    role: "Grade 11 Student, Mombasa",
    quote: "I was so confused about what subjects to pick for Senior School. This platform showed me exactly how my love for coding could lead to a real career in software development. Now I'm confident about my future!",
    initials: "AH"
  },
  // TEACHER
  {
    name: "Sarah Wanjiku",
    role: "CBE Integration Teacher, Nairobi",
    quote: "The teacher tools are a game-changer. I can input grades and instantly see which career pathways my students are suited for. It makes my guidance sessions so much more impactful.",
    initials: "SW"
  },
  // SCHOOL PRINCIPAL - from Nairobi
  {
    name: "Mr. David Omondi",
    role: "Principal, Nairobi School",
    quote: "Onboarding our school was simple. The platform helps our teachers connect classroom learning to real careers. We've seen student engagement rise as they understand the 'why' behind their subjects.",
    initials: "DO"
  }
];

const Testimonials = () => {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            Real Stories
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight">
            Trusted by students, teachers & schools
          </h2>
          <p className="text-foreground-muted mt-2 max-w-2xl mx-auto">
            Hear how Career Guide AI is making a difference across Kenya's CBE community
          </p>
        </div>

        {/* Desktop Grid - 3 Cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <Card key={i} className="p-7 border-card-border bg-card hover:shadow-card transition relative flex flex-col h-full">
              <Quote className="w-6 h-6 text-primary/60 absolute -top-3 -left-3" />
              <p className="text-lg leading-relaxed tracking-tight flex-1">"{t.quote}"</p>
              <div className="h-px bg-card-border my-5" />
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{t.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-foreground-muted">{t.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden">
          <div className="relative overflow-hidden">
            <div className="flex gap-4 pb-4 animate-scroll" style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              animation: 'scrollTestimonials 30s linear infinite'
            }}>
              {[...testimonials, ...testimonials].map((t, i) => (
                <Card key={`mobile-${i}`} className="flex-shrink-0 w-80 p-6 border-card-border bg-card hover:shadow-card transition relative">
                  <Quote className="w-5 h-5 text-primary/60 absolute -top-2 -left-2" />
                  <p className="text-base leading-relaxed tracking-tight pr-2 line-clamp-4">"{t.quote}"</p>
                  <div className="h-px bg-card-border my-4" />
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-sm">{t.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{t.name}</div>
                      <div className="text-xs text-foreground-muted truncate">{t.role}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;