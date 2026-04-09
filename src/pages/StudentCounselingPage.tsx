import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot, Sparkles } from "lucide-react";
import AIChat from "@/components/AIChat";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const StudentCounselingPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const getInitials = (name: string | null) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface/5">
      {/* Shared Header */}
      <header className="border-b border-card-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/student")}
                className="hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img
                src="/logos/CareerGuide_Logo.png"
                alt="CareerGuide AI"
                className="h-8 w-auto hidden sm:block"
              />
              <div className="h-4 w-px bg-card-border mx-2 hidden sm:block" />
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <h1 className="text-sm font-bold tracking-tight">AI Counseling</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 mr-2">
                <Avatar className="h-8 w-8 border border-primary/20">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-[10px] font-bold">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-bold text-foreground-muted">
                  {profile?.full_name?.split(' ')[0]}
                </span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Focus Area */}
      <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              1-on-1 Guidance
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </h2>
            <p className="text-foreground-muted font-bold text-sm mt-1">
              Ask about pathways, subjects, or market trends. Your AI counselor is ready.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/student")}
            className="border-card-border hover:bg-surface font-bold text-xs h-9 px-4 rounded-xl"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Full Chat Interface container */}
        <div className="flex-1 bg-card/40 backdrop-blur-xl border border-card-border rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
          <AIChat />
        </div>
      </main>
    </div>
  );
};

export default StudentCounselingPage;
