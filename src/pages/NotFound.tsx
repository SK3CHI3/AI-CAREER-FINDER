import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      window.location.pathname
    );
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--gradient-homepage)' }}>
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* Logo */}
        <div className="flex items-center justify-center mb-12">
          <img 
            src="/logos/CareerGuide_Logo.webp" 
            alt="CareerGuide AI" 
            className="h-20 w-auto drop-shadow-2xl animate-float"
          />
        </div>

        {/* 404 Visual */}
        <div className="relative mb-8">
          <h1 className="text-[12rem] font-black leading-none bg-gradient-text bg-clip-text text-transparent opacity-10">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-2xl sm:text-3xl font-bold text-foreground">Oops! Page not found.</p>
          </div>
        </div>

        <p className="text-foreground-muted mb-10 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            className="h-12 px-8 border-card-border hover:bg-surface"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button 
            className="h-12 px-8 bg-gradient-primary text-primary-foreground shadow-glow"
            onClick={() => navigate('/')}
          >
            <Home className="w-4 h-4 mr-2" />
            Home Page
          </Button>
        </div>

        {/* Footer text */}
        <p className="mt-16 text-sm text-foreground-muted/60">
          Shaping the future of Kenyan education · CareerGuide AI
        </p>
      </div>
    </div>
  );
};

export default NotFound;
