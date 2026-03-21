import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BackgroundGradient from "@/components/BackgroundGradient";
import { UserCircle, BrainCircuit, Bot, Map, School, CheckCircle2, ArrowRight, Play, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export default function HowItWorks() {
  const steps = [
    {
      id: "01",
      image: "/images/how_it_works_01.png",
      title: "Digital Onboarding",
      desc: "Begin by constructing your academic DNA. Our secure portal captures your grades, interests, and extracurricular passions to create a unique baseline for guidance.",
      accent: "bg-primary"
    },
    {
      id: "02",
      image: "/images/how_it_works_02.png",
      title: "RIASEC Diagnostics",
      desc: "Engage with a world-class psychometric assessment. We map your personality across the RIASEC spectrum to identify the hidden drivers of your career satisfaction.",
      accent: "bg-secondary"
    },
    {
      id: "03",
      image: "/images/how_it_works_03.png",
      title: "AI Analysis Engine",
      desc: "Our proprietary AI doesn't just guess; it predicts. By cross-referencing your profile with Kenya's market trends, we deliver precision-targeted career matches.",
      accent: "bg-accent"
    },
    {
      id: "04",
      image: "/images/how_it_works_04.png",
      title: "Curriculum Mapping",
      desc: "Abstract matches become concrete actions. We reverse-engineer your chosen career into CBE learning areas, telling you exactly which subjects to master.",
      accent: "bg-purple-500"
    },
    {
      id: "05",
      image: "/images/how_it_works_05.png",
      title: "Institutional Sync",
      desc: "Schools receive aggregated analytics to drive institutional success. Teachers can now organize specialized career immersion days with surgical precision.",
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
      
      <main className="flex-1 pt-32 pb-24 text-center">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
          <div className="max-w-4xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-8xl font-black mb-8 leading-[0.95] tracking-tight"
            >
              From Potential <br />
              <span className="bg-gradient-text bg-clip-text text-transparent italic font-serif">to Profession</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-foreground-muted font-medium leading-relaxed max-w-2xl mx-auto"
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
            className="relative p-12 md:p-24 rounded-[3rem] overflow-hidden shadow-3xl border border-card-border bg-card group flex items-center justify-center text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                <Play className="w-8 h-8 text-primary ml-1 relative z-10" />
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75" />
              </div>
              <h3 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
                Platform Walkthrough
              </h3>
              <p className="text-xl text-foreground-muted font-medium mb-8">
                Our complete deep-dive video demonstrating exactly how the CareerGuide AI engine interfaces with the CBC framework is currently in post-production.
              </p>
              <div className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full bg-surface border border-card-border shadow-sm text-sm font-bold text-primary uppercase tracking-widest hover:scale-105 transition-transform cursor-default">
                <Clock className="w-4 h-4" /> Coming Soon
              </div>
            </div>
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
                  <div className={`relative aspect-[4/3] rounded-[3rem] border border-card-border overflow-hidden group shadow-2xl`}>
                    <img 
                      src={step.image} 
                      alt={step.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80" />
                    
                    {/* Watermark Number */}
                    <div className="absolute bottom-4 right-8 text-[8rem] font-black text-white/20 leading-none select-none drop-shadow-lg">
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
