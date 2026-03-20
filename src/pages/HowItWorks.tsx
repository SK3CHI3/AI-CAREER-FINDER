import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BackgroundGradient from "@/components/BackgroundGradient";
import { UserCircle, BrainCircuit, Bot, Map, School, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      icon: UserCircle,
      title: "1. Create Your Digital Profile",
      desc: "Start by securely onboarding. Tell us about your current academic standing, your interests, and your overarching goals. This establishes the baseline for our AI.",
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20"
    },
    {
      id: 2,
      icon: BrainCircuit,
      title: "2. The RIASEC Assessment",
      desc: "Take our professionally calibrated psychological and aptitude assessment. We measure your Realistic, Investigative, Artistic, Social, Enterprising, and Conventional traits.",
      color: "text-secondary",
      bg: "bg-secondary/10",
      border: "border-secondary/20"
    },
    {
      id: 3,
      icon: Bot,
      title: "3. AI Predictive Matching",
      desc: "CareerGuide's proprietary AI engine cross-references your psychological matrix against Kenya's emerging job market data to generate precision career matches.",
      color: "text-accent",
      bg: "bg-accent/10",
      border: "border-accent/20"
    },
    {
      id: 4,
      icon: Map,
      title: "4. Lock Your CBE Pathway",
      desc: "Once a career is identified, the system maps backwards aligning with the CBC/CBE curriculum structure, recommending exactly which high school subjects to prioritize.",
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20"
    },
    {
      id: 5,
      icon: School,
      title: "5. Institutional & Teacher Sync",
      desc: "Your data securely syncs to your School's dashboard. Teachers gain bird's-eye analytical views of roster trends, allowing them to host tailored career days and invite specific experts.",
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20"
    }
  ];

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden relative flex flex-col">
      <BackgroundGradient />
      <Navigation />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-20">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-black font-serif mb-6 leading-tight"
            >
              Intelligence from end to end
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-foreground-muted font-medium max-w-2xl mx-auto"
            >
              See exactly how CareerGuide transforms abstract student interests into concrete, curriculum-aligned academic pathways.
            </motion.p>
          </div>

          {/* Timeline Container */}
          <div className="relative">
            {/* The Vertical Line Graphic */}
            <motion.div 
              initial={{ height: 0 }}
              whileInView={{ height: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-transparent -translate-x-1/2 rounded-full opacity-20" 
            />

            <div className="space-y-12 md:space-y-24">
              {steps.map((step, index) => {
                const isEven = index % 2 === 0;
                
                return (
                  <div key={step.id} className={`relative flex items-center md:justify-between flex-col md:flex-row ${isEven ? 'md:flex-row-reverse' : ''}`}>
                    
                    {/* Center Node on Line */}
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="absolute left-8 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-background border-4 border-card-border flex items-center justify-center z-10 shadow-glow-sm"
                    >
                      <div className={`w-4 h-4 rounded-full ${step.bg} border ${step.border} flex items-center justify-center`}>
                        <div className={`w-2 h-2 rounded-full bg-current ${step.color}`} />
                      </div>
                    </motion.div>

                    {/* Spacer for alternating layout (Desktop only) */}
                    <div className="hidden md:block md:w-5/12" />

                    {/* Content Card */}
                    <motion.div 
                      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="w-full md:w-5/12 pl-24 md:pl-0"
                    >
                      <div className="bg-gradient-surface border border-card-border p-8 rounded-3xl shadow-elevated hover:border-primary/30 transition-all duration-300 group">
                        <div className={`w-14 h-14 rounded-2xl ${step.bg} ${step.color} border ${step.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                          <step.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                        <p className="text-foreground-muted leading-relaxed font-medium">
                          {step.desc}
                        </p>
                      </div>
                    </motion.div>

                  </div>
                );
              })}
            </div>
            
            {/* Finish Node */}
            <div className="relative flex justify-start md:justify-center mt-12 md:mt-24">
              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="absolute left-8 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary flex items-center justify-center z-10 shadow-glow hidden md:flex"
              >
                <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-auto pl-24 md:pl-0 pt-2 md:pt-16 md:text-center"
              >
                <h3 className="text-3xl font-black mb-4">Ready to find your path?</h3>
                <a href="/auth" className="inline-flex items-center justify-center bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold shadow-glow hover:opacity-90 transition-opacity">
                  Get Started Now
                </a>
              </motion.div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
