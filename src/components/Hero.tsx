import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, School } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPathForRole } from "@/types/roles";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useState } from "react";

const Hero = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"student" | "school" | null>(null);
  const [showRoleOptions, setShowRoleOptions] = useState(true);

  const dashboardPath =
    user && profile
      ? getDashboardPathForRole(
        profile.role as "student" | "admin" | "school" | "teacher"
      )
      : "/student";

  const handleRoleSelect = (role: "student" | "school") => {
    setSelectedRole(role);
    setShowRoleOptions(false);
  };

  const handleGetStarted = () => {
    if (user) navigate(dashboardPath);
    else if (selectedRole) navigate(`/auth?mode=signup&role=${selectedRole}`);
  };

  const resetRoleSelection = () => {
    setSelectedRole(null);
    setShowRoleOptions(true);
  };

  return (
    <section className="min-h-screen flex items-center pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <div className="space-y-8">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              Help Students Discover{" "}
              <span className="bg-gradient-text bg-clip-text text-transparent">
                Their Future Careers Earlier.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-foreground-muted leading-relaxed max-w-2xl">
              Career Guide AI helps CBE schools turn classroom learning into clear career pathways through simple, affordable AI-powered guidance to their students.
            </p>

            {/* Button area with conditional rendering */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {showRoleOptions ? (
                // Role selection buttons
                <>
                  <Button
                    size="lg"
                    className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow px-8 py-6 text-lg flex-1"
                    onClick={() => handleRoleSelect("student")}
                  >
                    <GraduationCap className="w-5 h-5 mr-2" />
                    I'm a Student
                  </Button>
                  <Button
                    size="lg"
                    className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow px-8 py-6 text-lg flex-1"
                    onClick={() => handleRoleSelect("school")}
                  >
                    <School className="w-5 h-5 mr-2" />
                    I'm a School
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-card-border hover:bg-surface px-8 py-6 text-lg"
                    onClick={() =>
                      document
                        .getElementById("guest-chat")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Quick Assessment.
                  </Button>
                </>
              ) : (
                // Single action button after role selection
                <>
                  <Button
                    size="lg"
                    className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow px-8 py-6 text-lg flex-1"
                    onClick={handleGetStarted}
                  >
                    {selectedRole === "student" ? "Start your journey" : "Onboard your school"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-card-border hover:bg-surface px-8 py-6 text-lg"
                    onClick={() =>
                      document
                        .getElementById("guest-chat")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Try AI Chat
                  </Button>
                  {/* Optional: Back button to change role */}
                  <button
                    onClick={resetRoleSelection}
                    className="text-sm text-muted-foreground hover:text-foreground underline"
                  >
                    Not a {selectedRole}?
                  </button>
                </>
              )}
            </div>

            {/* Show selected role context when option is chosen */}
            {selectedRole && !showRoleOptions && (
              <p className="text-sm text-muted-foreground">
                {selectedRole === "student"
                  ? "✨ Continuing as Student"
                  : "🏫 Continuing as School"}
              </p>
            )}
          </div>


          {/* RIGHT CONTENT - Professionally sized */}
          <div className="relative flex items-center justify-center lg:justify-end select-none">
            {/* Animation container - just right */}
            <div
              className="relative z-10 w-[110%] lg:w-[600px] xl:w-[700px] pointer-events-none"
              style={{
                marginRight: '-5%', // Slight overflow to the right
              }}
              aria-hidden="true"
            >
              <div className="aspect-[4/3] w-full">
                <DotLottieReact
                  src="https://lottie.host/63e138b4-6a2a-42d0-88d6-ce61ba658d0c/PqnRt9UrJM.lottie"
                  loop={true}
                  autoplay={true}
                  className="w-full h-full"
                // That's it - keep it simple!
                />
              </div>
            </div>

            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-primary/5 rounded-full blur-[140px] -z-0 pointer-events-none"></div>

            {/* Gentle decorative elements */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;