import { CheckCircle2, ShieldCheck, BarChart3, Bot, BookOpen, Target, ArrowRight, Building2, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FeatureShowcase = () => {
  return (
    <section className="py-24 bg-surface relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
        
        {/* For Students Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Dashboard Mockup (Students) */}
          <div className="order-2 lg:order-1 bg-card rounded-2xl shadow-elevated border border-border overflow-hidden min-h-[540px] h-auto flex flex-col">
            <div className="bg-primary px-6 py-[24px] flex-shrink-0 flex items-center gap-3.5 text-primary-foreground">
              <div className="bg-white/10 border border-white/20 p-2 rounded-lg shrink-0">
                <UserCircle2 className="w-6 h-6 text-primary-foreground/90" />
              </div>
              <div>
                <h3 className="font-semibold text-[15px] leading-tight text-white/95">Amina's Pathway</h3>
                <p className="text-primary-foreground/70 text-[13px] font-medium mt-0.5">Student Insights</p>
              </div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-[15px] font-bold text-foreground mb-6">Top Career Matches</h4>
                <div className="space-y-4 mb-4">
                  <div className="flex justify-between items-center p-4 border border-border rounded-xl bg-card shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                        <Target className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-foreground text-[14px]">Software Engineer</span>
                    </div>
                    <span className="text-primary font-black text-[14px]">95% Match</span>
                  </div>
                  <div className="flex justify-between items-center p-4 border border-border rounded-xl bg-card shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-full flex items-center justify-center">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-foreground text-[14px]">Data Analyst</span>
                    </div>
                    <span className="text-primary font-black text-[14px]">88% Match</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-border mt-auto">
                <h4 className="text-[15px] font-bold text-foreground mb-4">CBE Subject Selection Guide</h4>
                <div className="p-5 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <h5 className="font-bold text-foreground text-[14px]">STEM Pathway Recommended</h5>
                  </div>
                  <p className="text-sm text-foreground-muted font-medium mb-4 pl-4 leading-relaxed">Focus on Computer Science and Mathematics for your desired career.</p>
                  <Button variant="outline" className="w-full rounded-xl border-primary/20 text-primary hover:bg-primary/10 text-[13px] font-bold h-10 shadow-sm">View Mapping</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold border border-primary/20">
              <UserCircle2 className="w-4 h-4" />
              <span>For Students</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight">
              What do students get?
            </h2>
            
            <p className="text-lg text-foreground-muted leading-relaxed max-w-lg font-medium">
              We help you find the perfect intersection between your passions and Kenya's emerging job market.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-5 bg-card p-5 rounded-2xl shadow-sm border border-border">
                <div className="bg-primary/10 p-2.5 rounded-full text-primary shrink-0 border border-primary/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[15px] font-bold text-card-foreground mb-1">AI-Powered Matching</h4>
                  <p className="text-sm text-foreground-muted leading-snug font-medium">Personalized recommendations based on your unique profile.</p>
                </div>
              </div>
              <div className="flex items-start gap-5 bg-primary/5 p-6 rounded-2xl border border-primary/20 shadow-glow-sm transition-all hover:scale-[1.02]">
                <div className="bg-primary/20 p-2.5 rounded-full text-primary shrink-0 border border-primary/30">
                  <Target className="w-5 h-5" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[16px] font-bold text-card-foreground mb-1.5">Career Days & Scholarships</h4>
                  <p className="text-sm text-foreground-muted leading-snug font-medium">Spend a day with professionals in your target field and discover scholarship opportunities to fund your dreams.</p>
                </div>
              </div>
            </div>
            
            <div className="pt-6">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-[15px] font-semibold border-none shadow-sm transition-all shadow-glow">
                Start your journey <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

        </div>

        {/* For Schools Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-secondary/10 text-secondary px-3 py-1.5 rounded-full text-sm font-semibold border border-secondary/20">
              <Building2 className="w-4 h-4" />
              <span>For Schools & Educators</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight">
              What do schools get?
            </h2>
            
            <p className="text-lg text-foreground-muted leading-relaxed max-w-lg font-medium">
              Empower your teachers with data-driven insights to support every student's unique journey through the CBE curriculum.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-5 bg-card p-5 rounded-2xl shadow-sm border border-border">
                <div className="bg-secondary/10 p-2.5 rounded-full text-secondary shrink-0 border border-secondary/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[15px] font-bold text-card-foreground mb-1">AI Student Insights</h4>
                  <p className="text-sm text-foreground-muted leading-snug font-medium">Use data-driven AI insights to help students make informed decisions about their future paths.</p>
                </div>
              </div>
              <div className="flex items-start gap-5 bg-secondary/5 p-6 rounded-2xl border border-secondary/20 shadow-glow-sm transition-all hover:scale-[1.02]">
                <div className="bg-secondary/20 p-2.5 rounded-full text-secondary shrink-0 border border-secondary/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[16px] font-bold text-card-foreground mb-1.5">Career Days Sync</h4>
                  <p className="text-sm text-foreground-muted leading-snug font-medium">Host industry experts at your school and organize immersion days where students spend quality time with mentors.</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 pt-6">
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full px-7 py-6 text-[15px] font-semibold shadow-sm transition-all border-none">
                Onboard my school <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
          
          {/* Right Dashboard Mockup */}
          <div className="bg-card rounded-2xl shadow-elevated border border-border overflow-hidden h-[540px] flex flex-col">
            {/* Header */}
            <div className="bg-secondary px-6 py-[18px] flex-shrink-0 flex items-center gap-3.5 text-secondary-foreground">
              <div className="bg-white/10 border border-white/20 p-2 rounded-lg shrink-0">
                <Building2 className="w-5 h-5 text-secondary-foreground/90" />
              </div>
              <div>
                <h3 className="font-semibold text-[15px] leading-tight text-white/95">Nairobi High School</h3>
                <p className="text-secondary-foreground/70 text-[13px] font-medium mt-0.5">School Dashboard</p>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-8 flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center pb-6 border-b border-border">
                <div className="text-center w-1/3">
                  <div className="text-2xl font-bold text-foreground leading-none mb-1">247</div>
                  <div className="text-[12px] text-foreground-muted font-medium">Students</div>
                </div>
                <div className="text-center w-1/3">
                  <div className="text-2xl font-bold text-foreground leading-none mb-1">1,842</div>
                  <div className="text-[12px] text-foreground-muted font-medium">Chats</div>
                </div>
                <div className="text-center w-1/3 border-r-0">
                  <div className="text-2xl font-bold text-foreground leading-none mb-1">89%</div>
                  <div className="text-[12px] text-foreground-muted font-medium">Success</div>
                </div>
              </div>
              
              <div className="py-6 border-b border-border">
                <div className="flex justify-between items-end mb-4">
                  <h4 className="text-[13px] font-bold text-foreground">Grade Progress</h4>
                  <span className="text-[11px] text-foreground-muted font-medium">Active now</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "G10", val: "75%", width: "75%" },
                    { label: "G11", val: "60%", width: "60%" }
                  ].map((row, i) => (
                    <div key={i} className="flex items-center text-[11px]">
                      <span className="w-10 text-foreground-muted font-medium">{row.label}</span>
                      <div className="flex-1 h-2 bg-surface-light rounded-full mx-3 overflow-hidden">
                        <div className="bg-secondary h-full rounded-full" style={{ width: row.width }}></div>
                      </div>
                      <span className="w-8 text-right font-bold text-foreground">{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-6">
                <h4 className="text-[13px] font-bold text-foreground mb-3">Recent Insights</h4>
                <ul className="text-[12px] space-y-2 text-foreground-muted font-medium italic">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary shrink-0"></div>
                    Interests in STEM quantified
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-secondary shrink-0"></div>
                    Subject selection trending
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
};

export default FeatureShowcase;

