import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BackgroundGradient from "@/components/BackgroundGradient";
import { UserCircle, BrainCircuit, Bot, Map, School, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export default function HowItWorks() {
  const steps = [
    {
      id: "01",
      icon: UserCircle,
      title: "Digital Onboarding",
      desc: "Begin by constructing your academic DNA. Our secure portal captures your grades, interests, and extracurricular passions to create a unique baseline for guidance.",
      color: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
      accent: "bg-primary"
    },
    {
      id: "02",
      icon: BrainCircuit,
      title: "RIASEC Diagnostics",
      desc: "Engage with a world-class psychometric assessment. We map your personality across the RIASEC spectrum to identify the hidden drivers of your career satisfaction.",
      color: "from-secondary/20 to-secondary/5",
      iconColor: "text-secondary",
      accent: "bg-secondary"
    },
    {
      id: "03",
      icon: Bot,
      title: "AI Analysis Engine",
      desc: "Our proprietary AI doesn't just guess; it predicts. By cross-referencing your profile with Kenya's market trends, we deliver precision-targeted career matches.",
      color: "from-accent/20 to-accent/5",
      iconColor: "text-accent",
      accent: "bg-accent"
    },
    {
      id: "04",
      icon: Map,
      title: "Curriculum Mapping",
      desc: "Abstract matches become concrete actions. We reverse-engineer your chosen career into CBE learning areas, telling you exactly which subjects to master.",
      color: "from-purple-500/20 to-purple-500/5",
      iconColor: "text-purple-500",
      accent: "bg-purple-500"
    },
    {
      id: "05",
      icon: School,
      title: "Institutional Sync",
      desc: "Schools receive aggregated analytics to drive institutional success. Teachers can now organize specialized career immersion days with surgical precision.",
      color: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-500",
      accent: "bg-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden relative flex flex-col bg-background">
      <Helmet>
        <title>How It Works | CareerGuide AI Journey</title>
        <meta name="description" content="Discover the step-by-step process of CareerGuide AI. From building a profile to matching with your dream career and syncing with your school curriculum." />
      </Helmet>
      
      <BackgroundGradient />
      <Navigation />
      
      <main className="flex-1 pt-32 pb-24">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              The Process
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-black mb-8 leading-[1.05] tracking-tight"
            >
              From Potential <br />
              <span className="bg-gradient-text bg-clip-text text-transparent italic font-serif">to Profession</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-foreground-muted font-medium leading-relaxed"
            >
              An end-to-end framework designed to eliminate career uncertainty for every Kenyan student in the CBE system.
            </motion.p>
          </div>
        </div>

        {/* Video Feature */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-40">
           <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-3xl border border-card-border bg-card group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
            <iframe 
              className="w-full h-full relative z-10"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="CareerGuide AI Overview"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </motion.div>
        </div>

        {/* Modern Steps Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-40">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={step.id} className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-24 ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                
                {/* Visual Side */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, x: isEven ? -40 : 40 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className="flex-1 w-full"
                >
                  <div className={`relative aspect-[4/3] rounded-[3rem] bg-gradient-to-br ${step.color} border border-card-border overflow-hidden group shadow-2xl`}>
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-32 h-32 rounded-[2rem] bg-background border border-card-border shadow-2xl flex items-center justify-center transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12`}>
                        <step.icon className={`w-14 h-14 ${step.iconColor}`} />
                      </div>
                    </div>
                    {/* Watermark Number */}
                    <div className="absolute -bottom-10 -right-10 text-[12rem] font-black text-foreground/5 leading-none select-none">
                      {step.id}
                    </div>
                  </div>
                </motion.div>

                {/* Content Side */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="flex-1 space-y-6"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${step.accent} text-white font-black text-xl shadow-lg mb-4`}>
                    {step.id}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                    {step.title}
                  </h2>
                  <p className="text-lg text-foreground-muted leading-relaxed font-medium">
                    {step.desc}
                  </p>
                  <div className="pt-4">
                    <button className="flex items-center gap-2 font-bold text-primary group">
                      Learn more about this phase
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Final CTA Full Width */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-60">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary rounded-[3.5rem] p-12 md:p-24 text-center overflow-hidden relative shadow-shadow-glow"
          >
            <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
              <CheckCircle2 className="w-64 h-64 text-white" />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                Ready to transform your school's future?
              </h2>
              <p className="text-xl text-primary-foreground/80 font-medium">
                Join the institutions already using AI to empower the next generation of Kenyan leaders.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <a href="/auth" className="bg-white text-primary px-10 py-5 rounded-full font-black text-lg shadow-xl hover:scale-105 transition-transform">
                  Get Started Today
                </a>
                <a href="/faq" className="bg-transparent border-2 border-white/20 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
                  Check FAQs
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
