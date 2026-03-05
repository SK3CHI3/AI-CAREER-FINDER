// Official logos - Uploaded to public/logos/ directory
const logos = [
  { src: "/logos/knec2%20logo.png", alt: "Kenya National Examinations Council", name: "KNEC" },
  { src: "/logos/kicd%20logo.png", alt: "Kenya Institute of Curriculum Development", name: "KICD" },
  { src: "/logos/MOE%20logo.png", alt: "Ministry of Education", name: "MoE" },
  { src: "/logos/tsc%20logo.png", alt: "Teachers Service Commission", name: "TSC" },
];

const LogosBand = () => {
  return (
    <section className="py-16 border-y border-card-border bg-surface/80 relative">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center text-sm font-semibold text-primary uppercase tracking-widest mb-10">
          Aligned with Kenya’s National Curriculum Framework (CBE)
        </div>

        {/* Desktop Grid */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
          {logos.map((logo, i) => (
            <div
              key={i}
              className="group w-24 h-24 rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="w-full h-full object-cover transition-all duration-300"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-full h-full bg-primary/10 rounded-full flex items-center justify-center"><span class="text-sm font-bold text-foreground-muted">${logo.name}</span></div>`;
                  }
                }}
              />
            </div>
          ))}
        </div>

        {/* Mobile Horizontal Scroll with Continuous Animation */}
        <div className="sm:hidden">
          <div className="relative overflow-hidden">
            <div className="flex gap-6 pb-4 scrollbar-hide" style={{
              animation: 'scrollLogos 20s linear infinite'
            }}>
              {/* First set of logos */}
              {logos.map((logo, i) => (
                <div
                  key={`first-${i}`}
                  className="flex-shrink-0 w-20 h-20 rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to text if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full bg-primary/10 rounded-full flex items-center justify-center"><span class="text-xs font-bold text-foreground-muted">${logo.name}</span></div>`;
                      }
                    }}
                  />
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {logos.map((logo, i) => (
                <div
                  key={`second-${i}`}
                  className="flex-shrink-0 w-20 h-20 rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to text if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full bg-primary/10 rounded-full flex items-center justify-center"><span class="text-xs font-bold text-foreground-muted">${logo.name}</span></div>`;
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LogosBand


