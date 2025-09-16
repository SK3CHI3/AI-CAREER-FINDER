import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, Briefcase, Compass } from "lucide-react";

const blocks = [
  {
    title: "How it works",
    desc: "Take a short CBE-aligned assessment, get pathway matches, and follow a roadmap.",
    image: "https://images.unsplash.com/photo-1556761175-129418cb2dfe?q=80&w=1600&auto=format&fit=crop",
    icon: Compass,
    cta: "Explore the flow",
  },
  {
    title: "Learn with purpose",
    desc: "Choose Senior School or TVET routes that map directly to real roles.",
    image: "https://images.unsplash.com/photo-1529336953121-4ca0ddbca6c1?q=80&w=1600&auto=format&fit=crop",
    icon: GraduationCap,
    cta: "View learning paths",
  },
  {
    title: "Land opportunities",
    desc: "Turn insights into action with entry requirements, skills and interview prep.",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1600&auto=format&fit=crop",
    icon: Briefcase,
    cta: "See career matches",
  },
];

const Explainers = () => {
  return (
    <section id="about" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">Why it matters</span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight">Made for modern learners</h2>
          <p className="mt-3 text-foreground-muted text-base sm:text-lg">Clear guidance, premium UX, and AI that actually helps you choose and grow.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {blocks.map((b, i) => (
            <Card key={i} className="overflow-hidden border-card-border bg-card hover:shadow-card transition">
              <div className="aspect-[16/9] relative">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="p-6 space-y-3">
                <div className="inline-flex items-center gap-2 text-primary">
                  <b.icon className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase tracking-wide">{b.title}</span>
                </div>
                <p className="text-foreground-muted leading-relaxed">{b.desc}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  {b.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Explainers;


