import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, BookOpen, TrendingUp, Building2 } from "lucide-react";

const items = [
  {
    eyebrow: "CBE Assessment",
    title: "AI-powered profile aligned to CBE strands",
    desc: "Map your competencies and interests to CBE pathways in minutes.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop",
    icon: Bot,
  },
  {
    eyebrow: "School Integration",
    title: "For schools and teachers",
    desc: "Schools onboard, teachers upload grades, and students get verified competency-based career insights.",
    image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1600&auto=format&fit=crop",
    icon: Building2,
  },
  {
    eyebrow: "Learning",
    title: "Personalized Senior School & TVET routes",
    desc: "Clear subject choices and TVET options that lead to real roles.",
    image: "https://images.unsplash.com/photo-1556761175-129418cb2dfe?q=80&w=1600&auto=format&fit=crop",
    icon: BookOpen,
  },
  {
    eyebrow: "Insights",
    title: "Live labour-market signals for Kenya",
    desc: "See in-demand skills, entry requirements, and salary ranges.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop",
    icon: TrendingUp,
  },
];

const FeatureShowcase = () => {
  return (
    <section id="features" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Built for Kenya’s CBE pathways</h2>
        </div>

        <div className="space-y-16">
          {items.map((item, idx) => (
            <div key={idx} className={`grid lg:grid-cols-2 gap-10 items-center ${idx % 2 === 1 ? 'lg:[&>div:first-child]:order-2' : ''}`}>
              <div className="relative overflow-hidden rounded-2xl shadow-elevated border border-card-border">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-primary">
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.eyebrow}</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-semibold tracking-tight leading-tight">{item.title}</h3>
                <p className="text-foreground-muted text-base sm:text-lg">{item.desc}</p>
                <Button variant="outline" size="sm">
                  Learn more <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;


