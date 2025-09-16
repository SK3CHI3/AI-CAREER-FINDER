// Replace these src paths with real logos placed under public/logos/* for production
const logos = [
  { src: "/logos/knec.svg", alt: "Kenya National Examinations Council" },
  { src: "/logos/tvet.svg", alt: "TVET Authority" },
  { src: "/logos/kepsa.svg", alt: "KEPSA" },
  { src: "/logos/kuccps.svg", alt: "KUCCPS" },
];

const LogosBand = () => {
  return (
    <section className="py-10 border-t border-card-border bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-foreground-muted mb-6">Recognised by learners and institutions across Kenya</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-center justify-items-center">
          {logos.map((l, i) => (
            <div key={i} className="w-16 h-16 rounded-full bg-card border border-card-border flex items-center justify-center shadow-sm hover:shadow-card transition overflow-hidden">
              <img src={l.src} alt={l.alt} className="w-12 h-12 object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LogosBand


