import { useEffect, useRef } from 'react';

const StatsPartnersSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // Duplicate content for infinite scroll
    const content = scrollContainer.innerHTML;
    scrollContainer.innerHTML = content + content;

    let animationFrame: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.6; // Smooth, slow scroll

    const smoothScroll = () => {
      if (!scrollContainer) return;

      scrollPosition += scrollSpeed;

      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }

      scrollContainer.scrollLeft = scrollPosition;
      animationFrame = requestAnimationFrame(smoothScroll);
    };

    animationFrame = requestAnimationFrame(smoothScroll);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const partners = [
    { name: 'Ministry of Education', logo: '/logos/MOE logo.png' },
    { name: 'KNEC', logo: '/logos/knec2 logo.png' },
    { name: 'TSC', logo: '/logos/tsc logo.png' },
    { name: 'MMU', logo: '/logos/mmu logo.png' },
    { name: 'KCA University', logo: '/logos/kca logo.png' },
  ];

  return (
    <section className="py-20 bg-gradient-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Card Container with theme colors */}
        <div className="bg-card/80 backdrop-blur-sm rounded-3xl border border-card-border overflow-hidden shadow-card hover:shadow-elevated transition-shadow duration-500">

          {/* Stats Section with Images */}
          <div className="p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-text bg-clip-text text-transparent mb-4">
                Making an Impact Across Kenya
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto">
                Join thousands of Kenyan students who've found their path with CareerGuide AI
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">

              {/* Card 1 - Students Guided */}
              <div className="group relative rounded-2xl overflow-hidden bg-surface/50 border border-card-border hover:border-primary/30 hover:shadow-glow transition-all duration-500">
                {/* Image Container with Blue Gradient Overlay */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="/images/students.jpg"
                    alt="Students"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Blue gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="text-4xl font-bold text-foreground drop-shadow-lg">500K+</div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">STUDENTS GUIDED</div>
                  <p className="text-foreground-muted text-sm">
                    Helping Kenyan students discover careers aligned with the CBE framework
                  </p>
                </div>
              </div>

              {/* Card 2 - Partner Institutions */}
              <div className="group relative rounded-2xl overflow-hidden bg-surface/50 border border-card-border hover:border-primary/30 hover:shadow-glow transition-all duration-500">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="/images/institutions.jpg"
                    alt="Partner Institutions"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Blue gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="text-4xl font-bold text-foreground drop-shadow-lg">15+</div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">PARTNER INSTITUTIONS</div>
                  <p className="text-foreground-muted text-sm">
                    Collaborating with government bodies and educational organizations
                  </p>
                </div>
              </div>

              {/* Card 3 - Counties Covered */}
              <div className="group relative rounded-2xl overflow-hidden bg-surface/50 border border-card-border hover:border-primary/30 hover:shadow-glow transition-all duration-500">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="/images/counties.png"
                    alt="Kenya Counties"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Blue gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="text-4xl font-bold text-foreground drop-shadow-lg">47</div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">COUNTIES COVERED</div>
                  <p className="text-foreground-muted text-sm">
                    Nationwide reach serving students across all counties in Kenya
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Partners Section - With theme styling */}
          <div className="border-t border-card-border bg-gradient-surface py-12 px-8 md:px-12">
            <div className="text-center mb-8">
              <p className="text-sm uppercase tracking-wider text-foreground-muted font-semibold relative inline-block">
                <span className="relative z-10 px-4">OUR PARTNER INSTITUTIONS</span>
                <span className="absolute inset-0 bg-primary/5 blur-xl rounded-full"></span>
              </p>
            </div>

            {/* Scrolling Logos - No frames, bigger */}
            <div className="relative overflow-hidden">
              {/* Gradient overlays with theme colors */}
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gradient-surface via-gradient-surface/50 to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gradient-surface via-gradient-surface/50 to-transparent z-10" />

              {/* Scrolling container - Super smooth */}
              <div
                ref={scrollRef}
                className="flex overflow-x-hidden gap-16 items-center no-scrollbar"
                style={{ scrollBehavior: 'auto' }}
              >
                {[...partners, ...partners].map((partner, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 flex items-center justify-center h-24 w-40"
                  >
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-full max-w-full object-contain opacity-60"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative element */}
            <div className="flex justify-center mt-8">
              <div className="w-24 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsPartnersSection;

