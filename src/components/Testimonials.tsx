import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

const testimonials = [
  { name: "Amina", role: "Senior School (STEM)", quote: "Now I can pick subjects that align to the ICT pathway.", initials: "AM" },
  { name: "Brian", role: "Senior School (Arts)", quote: "The platform mapped my competencies to clear CBE routes.", initials: "BR" },
  { name: "Sofia", role: "TVET Diploma", quote: "My skills plan matched directly to local job requirements.", initials: "SF" },
];

const Testimonials = () => {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">Results</span>
          <h2 className="mt-4 text-2xl sm:text-5xl font-bold tracking-tight">Clarity for Kenya’s CBE learners</h2>
          <p className="text-foreground-muted mt-2">Real guidance, real outcomes</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <Card key={i} className="p-7 border-card-border bg-card hover:shadow-card transition relative">
              <Quote className="w-6 h-6 text-primary/60 absolute -top-3 -left-3" />
              <p className="text-xl leading-relaxed tracking-tight">“{t.quote}”</p>
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
      </div>
    </section>
  );
};

export default Testimonials;


