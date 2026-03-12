import { useEffect, useRef, useState } from "react";
import { Bot, Users, BookOpen, Target } from "lucide-react";

const features = [
  {
    id: "ai-pathways",
    icon: Bot,
    title: "AI-Powered Career Pathways",
    description: "Connects CBE learning areas to real career opportunities, helping students explore clear future paths aligned with their competencies.",
    color: "text-primary",
    image: "/images/feature-pathways.jpg",
    stat: "500+ pathways"
  },
  {
    id: "teacher-dashboard",
    icon: Users,
    title: "Teacher Guidance Dashboard",
    description: "Provides teachers with simple tools to support structured career exploration and track student progress within the CBE framework.",
    color: "text-secondary",
    image: "/images/feature-teacher.jpg",
    stat: "1,000+ teachers"
  },
  {
    id: "offline-access",
    icon: BookOpen,
    title: "Offline & Low-Connectivity Access",
    description: "Works seamlessly in schools with limited internet, ensuring students in rural and underserved areas can always access guidance.",
    color: "text-accent",
    image: "/images/feature-offline.jpg",
    stat: "47 counties"
  },
  {
    id: "secure-platform",
    icon: Target,
    title: "Secure & Student-Safe Platform",
    description: "Built with strong privacy protections to keep student information secure and responsibly handled.",
    color: "text-primary",
    image: "/images/feature-secure.jpg",
    stat: "100% secure"
  }
];

const Features = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionRefs.current.findIndex(ref => ref === entry.target);
            if (index !== -1) setActiveFeature(index);
          }
        });
      },
      {
        root: null,
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0
      }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    // Check when we reach the end of the section
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // If the bottom of the section is above the viewport, stop sticking
        if (rect.bottom < windowHeight / 2) {
          setIsSticky(false);
        } else {
          setIsSticky(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section className="py-24 bg-surface relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-hero opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Built for{" "}
            <span className="bg-gradient-text bg-clip-text text-transparent">
              Kenyan Education
            </span>
          </h2>
          <p className="text-lg text-foreground-muted">
            Four powerful features designed to transform career guidance for CBE students
          </p>
        </div>

        {/* Main grid */}
        <div
          ref={containerRef}
          className="grid lg:grid-cols-2 gap-12 lg:gap-16"
        >

          {/* Left: Features list */}
          <div className="space-y-6 pb-96 lg:pb-0">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                ref={(el) => (sectionRefs.current[index] = el)}
                className="scroll-mt-32"
              >
                <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${activeFeature === index
                    ? 'border-primary bg-gradient-surface shadow-glow'
                    : 'border-card-border bg-surface/50'
                  }`}>

                  {/* Active indicator */}
                  {activeFeature === index && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-primary to-secondary rounded-r-full" />
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg bg-surface flex items-center justify-center flex-shrink-0 transition-all duration-300 ${activeFeature === index ? 'scale-110' : ''
                      }`}>
                      <feature.icon className={`w-5 h-5 ${activeFeature === index ? feature.color : 'text-foreground-muted'}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 ${activeFeature === index ? feature.color : 'text-foreground'
                        }`}>
                        {feature.title}
                      </h3>
                      <p className="text-sm text-foreground-muted leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Stat - shows on active */}
                      {activeFeature === index && (
                        <div className="mt-3 inline-block">
                          <span className={`text-xs font-medium ${feature.color} bg-primary/10 px-3 py-1 rounded-full`}>
                            {feature.stat}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Sticky image display */}
          <div className={`lg:block ${isSticky ? 'lg:sticky lg:top-32' : 'lg:relative'}`}>
            <div className="relative rounded-2xl overflow-hidden shadow-elevated aspect-[4/5]">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  className={`absolute inset-0 transition-all duration-700 ${activeFeature === index
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-105'
                    }`}
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />

                  {/* Feature number */}
                  <div className="absolute top-6 left-6">
                    <span className="text-sm font-medium text-foreground/60 bg-surface/80 backdrop-blur-sm px-3 py-1 rounded-full">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h4 className="text-2xl font-bold text-foreground mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-foreground-muted">
                      {feature.stat}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress indicator */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      sectionRefs.current[index]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                      });
                    }}
                    className={`h-1 rounded-full transition-all duration-300 ${activeFeature === index
                        ? 'w-8 bg-primary'
                        : 'w-4 bg-foreground-muted/20 hover:bg-foreground-muted/40'
                      }`}
                  />
                ))}
              </div>

              <span className="text-sm text-foreground-muted">
                {String(activeFeature + 1).padStart(2, '0')} / {String(features.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;

