import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

const testimonials = [
  { 
    name: "Amina Hassan", 
    role: "Grade 11, Mombasa", 
    quote: "I was so confused about what subjects to pick for Senior School. This platform showed me exactly how my love for coding could lead to a real career in software development. Now I'm confident about my future!", 
    initials: "AH" 
  },
  { 
    name: "Brian Otieno", 
    role: "Grade 10, Nairobi", 
    quote: "My parents wanted me to do medicine, but I love art and design. This AI helped me see that I can actually make a living from my creativity. I'm now planning to pursue graphic design!", 
    initials: "BO" 
  },
  { 
    name: "Sofia Mwangi", 
    role: "TVET Student, Nakuru", 
    quote: "I thought I had to go to university to be successful. This platform showed me amazing technical courses that match my hands-on learning style. I'm now studying automotive engineering!", 
    initials: "SM" 
  },
  { 
    name: "David Kimani", 
    role: "Grade 12, Kisumu", 
    quote: "The career guidance was like having a personal counselor. It understood my interests in business and technology, and showed me how to combine them. I'm now planning to study business information systems.", 
    initials: "DK" 
  },
  { 
    name: "Grace Wanjiku", 
    role: "Grade 9, Eldoret", 
    quote: "I was worried about my future because I didn't know what I wanted to do. This platform helped me discover my passion for environmental science. Now I have a clear path forward!", 
    initials: "GW" 
  },
  { 
    name: "James Muthoni", 
    role: "Grade 11, Thika", 
    quote: "The AI recommendations were surprisingly accurate! It suggested I look into data science, and after researching it, I realized it's perfect for me. I'm now excited about my future career!", 
    initials: "JM" 
  },
];

const Testimonials = () => {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">Real Stories</span>
          <h2 className="mt-4 text-2xl sm:text-5xl font-bold tracking-tight">Students who found their path</h2>
          <p className="text-foreground-muted mt-2">Hear from Kenyan students who discovered their perfect career match</p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {testimonials.slice(0, 3).map((t, i) => (
            <Card key={i} className="p-7 border-card-border bg-card hover:shadow-card transition relative">
              <Quote className="w-6 h-6 text-primary/60 absolute -top-3 -left-3" />
              <p className="text-xl leading-relaxed tracking-tight">"{t.quote}"</p>
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
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {testimonials.map((t, i) => (
              <Card key={i} className="flex-shrink-0 w-80 p-6 border-card-border bg-card hover:shadow-card transition relative">
                <Quote className="w-5 h-5 text-primary/60 absolute -top-2 -left-2" />
                <p className="text-lg leading-relaxed tracking-tight pr-2">"{t.quote}"</p>
                <div className="h-px bg-card-border my-4" />
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-sm">{t.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-foreground-muted">{t.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;


