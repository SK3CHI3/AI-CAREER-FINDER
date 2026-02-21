import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPathForRole } from "@/types/roles";

const Hero = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const dashboardPath = user && profile ? getDashboardPathForRole(profile.role as 'student' | 'admin' | 'school' | 'teacher') : "/student";

  return (
    <section className="min-h-screen flex items-center pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-surface/50 backdrop-blur-sm rounded-full border border-card-border">
              <Sparkles className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm text-foreground-muted">
                For students, schools & educators · Kenya's CBE System
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              Discover Your{" "}
              <span className="bg-gradient-text bg-clip-text text-transparent">
                Perfect Career
              </span>{" "}
              Path with AI
            </h1>
            
            <p className="text-lg sm:text-xl text-foreground-muted leading-relaxed max-w-2xl">
              Navigate Kenya’s Competency-Based Education (CBE) with intelligent guidance. 
              Students get personalized career insights; schools and teachers manage grades and verify competencies.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow px-8 py-6 text-lg"
                onClick={() => {
                  if (user) {
                    navigate(dashboardPath);
                  } else {
                    navigate('/auth');
                  }
                }}
              >
                {user ? 'Go to Dashboard' : 'Start Free Assessment'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-card-border hover:bg-surface px-8 py-6 text-lg"
                onClick={() => document.getElementById('guest-chat')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Try AI Chat
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-card-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">5,000+</div>
                <div className="text-sm text-foreground-muted">Students Guided</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">200+</div>
                <div className="text-sm text-foreground-muted">Career Paths</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">95%</div>
                <div className="text-sm text-foreground-muted">Accuracy Rate</div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src="/images/hero-interface.png"
                alt="AI Career Guidance Platform - Mobile App Interface with Career Icons"
                className="w-full h-auto rounded-2xl shadow-elevated"
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-accent/30 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;