import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Clock, ArrowRight } from "lucide-react";

const careerPaths = [
  {
    title: "Software Engineering",
    demand: "High",
    salaryRange: "KES 80K - 300K",
    growth: "+25%",
    skills: ["Programming", "Problem Solving", "System Design"],
    description: "Build the digital future with cutting-edge software solutions."
  },
  {
    title: "Data Science",
    demand: "Very High",
    salaryRange: "KES 100K - 400K",
    growth: "+30%",
    skills: ["Analytics", "Machine Learning", "Statistics"],
    description: "Transform data into actionable insights for business growth."
  },
  {
    title: "Healthcare Technology",
    demand: "High",
    salaryRange: "KES 70K - 250K",
    growth: "+20%",
    skills: ["Medical Knowledge", "Technology", "Innovation"],
    description: "Revolutionize healthcare delivery through technology."
  },
  {
    title: "Renewable Energy",
    demand: "Growing",
    salaryRange: "KES 60K - 200K",
    growth: "+35%",
    skills: ["Engineering", "Sustainability", "Project Management"],
    description: "Lead Kenya's transition to sustainable energy solutions."
  },
  {
    title: "Digital Marketing",
    demand: "High",
    salaryRange: "KES 50K - 180K",
    growth: "+22%",
    skills: ["Creativity", "Analytics", "Communication"],
    description: "Drive business growth through innovative digital strategies."
  },
  {
    title: "Agricultural Technology",
    demand: "Emerging",
    salaryRange: "KES 55K - 190K",
    growth: "+28%",
    skills: ["Agriculture", "Technology", "Innovation"],
    description: "Transform farming with smart technology and data."
  }
];

const getDemandColor = (demand: string) => {
  switch (demand) {
    case "Very High": return "bg-success/20 text-success border-success/30";
    case "High": return "bg-primary/20 text-primary border-primary/30";
    case "Growing": return "bg-warning/20 text-warning border-warning/30";
    case "Emerging": return "bg-accent/20 text-accent border-accent/30";
    default: return "bg-foreground/20 text-foreground border-foreground/30";
  }
};

const CareerPaths = () => {
  return (
    <section id="careers" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Trending{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Career Opportunities
            </span>
          </h2>
          <p className="text-xl text-foreground-muted max-w-3xl mx-auto">
            Explore high-demand career paths in Kenya's evolving job market, 
            with real-time insights on demand, salaries, and growth projections.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {careerPaths.map((career, index) => (
            <Card 
              key={index}
              className="bg-gradient-surface border-card-border p-6 hover:shadow-card transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {career.title}
                  </h3>
                  <Badge className={getDemandColor(career.demand)}>
                    {career.demand}
                  </Badge>
                </div>
                
                <p className="text-foreground-muted">
                  {career.description}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-foreground-muted" />
                      <span className="text-sm text-foreground-muted">Salary Range</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{career.salaryRange}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-foreground-muted" />
                      <span className="text-sm text-foreground-muted">Growth Rate</span>
                    </div>
                    <span className="text-sm font-medium text-success">{career.growth}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm text-foreground-muted">Key Skills:</span>
                  <div className="flex flex-wrap gap-2">
                    {career.skills.map((skill, skillIndex) => (
                      <Badge 
                        key={skillIndex}
                        variant="outline"
                        className="text-xs border-card-border"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-between hover:bg-surface group-hover:text-primary"
                >
                  Explore Path
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
          >
            Discover My Career Path
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CareerPaths;