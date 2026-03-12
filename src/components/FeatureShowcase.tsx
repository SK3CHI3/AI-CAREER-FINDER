import { CheckCircle2, ShieldCheck, BarChart3, Bot, BookOpen, Target, ArrowRight, Building2, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FeatureShowcase = () => {
  return (
    <section className="py-24 bg-surface relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
        
        {/* For Schools Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-secondary/10 text-secondary px-3 py-1.5 rounded-full text-sm font-semibold border border-secondary/20">
              <Building2 className="w-4 h-4" />
              <span>For Schools & Educators</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight">
              Career guidance that <br className="hidden md:block"/> scales
            </h2>
            
            <p className="text-lg text-foreground-muted leading-relaxed max-w-lg font-medium">
              Give every student access to personalised career guidance—without hiring more staff. Track progress, extract insights, and support your CBE obligations.
            </p>
            
            <div className="space-y-4 pt-4">
              {/* Feature Card 1 (Active equivalent) */}
              <div className="flex items-start gap-5 bg-card p-5 rounded-2xl shadow-sm border border-border">
                <div className="bg-secondary/10 p-2.5 rounded-full text-secondary shrink-0 border border-secondary/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[15px] font-bold text-card-foreground mb-1">CBE Benchmarks alignment</h4>
                  <p className="text-sm text-foreground-muted leading-snug font-medium">Supports all requirements for careers guidance in schools</p>
                </div>
              </div>
              
              {/* Feature Card 2 */}
              <div className="flex items-start gap-5 bg-transparent p-5 rounded-2xl border border-transparent hover:bg-surface-light transition-colors">
                <div className="bg-surface-light p-2.5 rounded-full text-foreground-muted shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[15px] font-bold text-card-foreground mb-1">Safeguarding compliant</h4>
                  <p className="text-sm text-foreground-muted leading-snug font-medium">Data Protection Act Kenya compliant with full audit trails</p>
                </div>
              </div>
              
              {/* Feature Card 3 */}
              <div className="flex items-start gap-5 bg-transparent p-5 rounded-2xl border border-transparent hover:bg-surface-light transition-colors">
                <div className="bg-surface-light p-2.5 rounded-full text-foreground-muted shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[15px] font-bold text-card-foreground mb-1">Progress tracking dashboard</h4>
                  <p className="text-sm text-foreground-muted leading-snug font-medium">See student engagement, insights gained, and goals set</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 pt-6">
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full px-7 py-6 text-[15px] font-semibold shadow-sm transition-all border-none">
                Learn More <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <span className="text-[13px] text-foreground-subtle font-medium leading-tight">Used by careers leads across <br/>Kenyan secondary schools</span>
            </div>
          </div>
          
          {/* Right Dashboard Mockup */}
          <div className="bg-card rounded-2xl shadow-elevated border border-border overflow-hidden ml-4">
            {/* Header */}
            <div className="bg-secondary px-6 py-[18px] flex items-center gap-3.5 text-secondary-foreground">
              <div className="bg-white/10 border border-white/20 p-2 rounded-lg shrink-0">
                <Building2 className="w-5 h-5 text-secondary-foreground/90" />
              </div>
              <div>
                <h3 className="font-semibold text-[15px] leading-tight text-white/95">Nairobi High School</h3>
                <p className="text-secondary-foreground/70 text-[13px] font-medium mt-0.5">School Dashboard</p>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-8">
              {/* Stats Row */}
              <div className="flex justify-between items-center pb-8 border-b border-border">
                <div className="text-center w-1/3">
                  <div className="text-2xl font-bold text-foreground leading-none mb-2">247</div>
                  <div className="text-[13px] text-foreground-muted font-medium">Active Students</div>
                </div>
                <div className="text-center w-1/3">
                  <div className="text-2xl font-bold text-foreground leading-none mb-2">1,842</div>
                  <div className="text-[13px] text-foreground-muted font-medium">Conversations</div>
                </div>
                <div className="text-center w-1/3">
                  <div className="text-2xl font-bold text-foreground leading-none mb-2">89%</div>
                  <div className="text-[13px] text-foreground-muted font-medium">Engagement</div>
                </div>
              </div>
              
              {/* Progress Bars */}
              <div className="py-8 border-b border-border">
                <div className="flex justify-between items-end mb-6">
                  <h4 className="text-[15px] font-bold text-foreground">Grade Level Progress</h4>
                  <span className="text-[13px] text-foreground-muted font-medium">Last 30 days</span>
                </div>
                
                <div className="space-y-[18px]">
                  {[
                    { label: "Grade 10", val: "75%", width: "75%" },
                    { label: "Grade 11", val: "60%", width: "60%" },
                    { label: "Grade 12", val: "45%", width: "45%" }
                  ].map((row, i) => (
                    <div key={i} className="flex items-center text-[13px]">
                      <span className="w-16 text-foreground-muted font-medium">{row.label}</span>
                      <div className="flex-1 h-3 bg-surface-light rounded-full mx-4 overflow-hidden">
                        <div className="bg-secondary h-full rounded-full" style={{ width: row.width }}></div>
                      </div>
                      <span className="w-10 text-right font-bold text-foreground">{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Insights */}
              <div className="pt-8 block">
                <h4 className="text-[15px] font-bold text-foreground mb-6">Recent Insights Extracted</h4>
                <ul className="text-sm space-y-4 text-foreground-muted font-medium">
                  <li className="flex items-center gap-3.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                    Student showed interest in healthcare careers
                  </li>
                  <li className="flex items-center gap-3.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0"></div>
                    New goal set: Research apprenticeships
                  </li>
                  <li className="flex items-center gap-3.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0"></div>
                    Achievement unlocked: First career match
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* For Students Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center pt-8">
          
          {/* Left Dashboard Mockup (Students) */}
          <div className="order-2 lg:order-1 bg-card rounded-2xl shadow-elevated border border-border overflow-hidden mr-4">
            <div className="bg-primary px-6 py-[18px] flex items-center gap-3.5 text-primary-foreground">
              <div className="bg-white/10 border border-white/20 p-2 rounded-lg shrink-0">
                <UserCircle2 className="w-5 h-5 text-primary-foreground/90" />
              </div>
              <div>
                <h3 className="font-semibold text-[15px] leading-tight text-white/95">Amina's Pathway</h3>
                <p className="text-primary-foreground/70 text-[13px] font-medium mt-0.5">Student Insights</p>
              </div>
            </div>
            
            <div className="p-8">
              <h4 className="text-[15px] font-bold text-foreground mb-6">Top Career Matches</h4>
              <div className="space-y-4 mb-8">
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
              
              <div className="pt-8 border-t border-border">
                <h4 className="text-[15px] font-bold text-foreground mb-5">CBE Subject Selection Guide</h4>
                <div className="p-5 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <h5 className="font-bold text-foreground text-[14px]">STEM Pathway Recommended</h5>
                  </div>
                  <p className="text-sm text-foreground-muted font-medium mb-5 pl-4 leading-relaxed">Focus on Computer Science, Mathematics, and Physics to build a strong foundation for your desired career.</p>
                  <Button variant="outline" className="w-full rounded-xl border-primary/20 text-primary hover:bg-primary/10 text-[13px] font-bold h-11 shadow-sm">View Curriculum Mapping</Button>
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
              Discover your perfect <br className="hidden md:block"/> career path
            </h2>
            
            <p className="text-lg text-foreground-muted leading-relaxed max-w-lg font-medium">
              Find the perfect intersection between what you love doing and real-world opportunities. CareerGuide AI helps you navigate the CBE to reach your dream job.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-5 bg-card p-5 rounded-2xl shadow-sm border border-border">
                <div className="bg-primary/10 p-2.5 rounded-full text-primary shrink-0 border border-primary/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[15px] font-bold text-card-foreground mb-1">AI-Powered Matching</h4>
                  <p className="text-sm text-foreground-muted leading-snug font-medium">Connects your unique interests and personality to actual careers.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-5 bg-transparent p-5 rounded-2xl border border-transparent hover:bg-surface-light transition-colors">
                <div className="bg-surface-light p-2.5 rounded-full text-foreground-muted shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[15px] font-bold text-card-foreground mb-1">Subject Selection Guide</h4>
                  <p className="text-sm text-foreground-muted leading-snug font-medium">Know exactly which CBE learning areas to choose for your desired pathway.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-5 bg-transparent p-5 rounded-2xl border border-transparent hover:bg-surface-light transition-colors">
                <div className="bg-surface-light p-2.5 rounded-full text-foreground-muted shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[15px] font-bold text-card-foreground mb-1">Actionable Next Steps</h4>
                  <p className="text-sm text-foreground-muted leading-snug font-medium">Get clear, practical steps from your current grade to university and employment.</p>
                </div>
              </div>
            </div>
            
            <div className="pt-6">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-[15px] font-semibold border-none shadow-sm transition-all">
                Start Exploring <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default FeatureShowcase;

