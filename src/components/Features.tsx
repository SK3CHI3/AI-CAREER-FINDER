import { Bot, TrendingUp, BookOpen, Users, BarChart3, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Assessment",
    description: "Advanced algorithms analyze your CBE performance, interests, and skills to provide personalized career recommendations.",
    color: "text-primary"
  },
  {
    icon: TrendingUp,
    title: "Real-Time Market Insights",
    description: "Access live data on job demand, salary trends, and growth opportunities in both Kenyan and global markets.",
    color: "text-secondary"
  },
  {
    icon: BookOpen,
    title: "Personalized Learning Paths",
    description: "Get custom roadmaps with courses, skills development, and mentorship opportunities tailored to your career goals.",
    color: "text-accent"
  },
  {
    icon: Target,
    title: "CBE Integration",
    description: "Specifically designed for Kenya's Competency-Based Education system with deep understanding of CBE structure.",
    color: "text-primary"
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Monitor your academic performance, skill development, and career readiness with comprehensive analytics.",
    color: "text-secondary"
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Connect with peers, mentors, and career counselors in a supportive community ecosystem.",
    color: "text-accent"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-background-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Intelligent Career Guidance{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Built for Kenya
            </span>
          </h2>
          <p className="text-xl text-foreground-muted max-w-3xl mx-auto">
            Our platform combines cutting-edge AI technology with deep understanding of Kenya's education system 
            to provide unparalleled career guidance for CBE students.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-gradient-surface border-card-border p-8 hover:shadow-card transition-all duration-300 group"
            >
              <div className="mb-6">
                <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-foreground-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;