import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, GraduationCap, Briefcase } from "lucide-react";
import { CounselorDirectory } from "@/components/CounselorDirectory";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogOut } from "lucide-react";

const Counselors = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-card-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button onClick={() => navigate("/student")}>
                <img
                  src="/logos/CareerGuide_Logo.webp"
                  alt="CareerGuide AI"
                  className="h-10 w-auto"
                />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-foreground">
                    {profile?.full_name || "Student"}
                  </p>
                  <Badge className="bg-primary text-primary-foreground">Student</Badge>
                </div>
              </div>
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 sm:mb-6 hover:bg-muted font-bold text-xs"
          onClick={() => navigate("/student")}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
 
        <div className="relative mb-8 sm:mb-12">
          {/* Background Watermark Logo */}
          <div className="absolute -top-10 -right-10 sm:-top-16 sm:-right-16 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <img src="/logos/CareerGuide_Logo.webp" alt="" className="w-48 sm:w-80 h-auto grayscale" />
          </div>
 
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
              <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              Specialized Counselors
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Connect with verified experts to build your professional roadmap.
            </p>
          </div>
        </div>


        <CounselorDirectory />
      </main>
    </div>
  );
};

export default Counselors;
