// Official logos - Uploaded to public/logos/ directory
const logos = [
  { src: "/logos/knec2%20logo.png", alt: "Kenya National Examinations Council", name: "KNEC" },
  { src: "/logos/kicd%20logo.png", alt: "Kenya Institute of Curriculum Development", name: "KICD" },
  { src: "/logos/MOE%20logo.png", alt: "Ministry of Education", name: "MoE" },
  { src: "/logos/tsc%20logo.png", alt: "Teachers Service Commission", name: "TSC" },
];

const LogosBand = () => {
  return (
    <section className="py-12 border-t border-card-border bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-foreground-muted mb-8">
          Recognised by learners and institutions across Kenya
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
                onLoad={() => console.log(`✅ Logo loaded: ${logo.name}`)}
                onError={(e) => {
                  console.error(`❌ Logo failed to load: ${logo.src}`);
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
                    onLoad={() => console.log(`✅ Mobile logo loaded: ${logo.name}`)}
                    onError={(e) => {
                      console.error(`❌ Mobile logo failed to load: ${logo.src}`);
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
                    onLoad={() => console.log(`✅ Mobile logo loaded: ${logo.name}`)}
                    onError={(e) => {
                      console.error(`❌ Mobile logo failed to load: ${logo.src}`);
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


