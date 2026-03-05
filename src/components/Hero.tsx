import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight max-w-4xl">
              Give Your School{" "}
              <span className="bg-gradient-text bg-clip-text text-transparent">
                AI-Powered Career Guidance
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-foreground-muted leading-relaxed max-w-2xl">
              Onboard your institution, let teachers upload grades, and deliver competency-based career insights to every student. Built for Kenyan schools and aligned with CBE.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow px-8 py-6 text-lg"
                onClick={() => {
                  if (user) {
                    navigate(dashboardPath);
                  } else {
                    navigate('/auth?mode=signup&role=school');
                  }
                }}
              >
                {user ? 'Go to Dashboard' : 'Onboard my school'}
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
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="/images/hero-dashboard.png"
                alt="CareerGuide AI Platform - Advanced Student Dashboard Mockup showing RIASEC scores and career pathing"
                className="w-full h-auto rounded-2xl shadow-elevated border border-card-border/50"
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
