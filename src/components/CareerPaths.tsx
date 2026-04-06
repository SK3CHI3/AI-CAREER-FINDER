import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Clock, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { dashboardService, CareerPath } from "@/lib/dashboard-service";

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
  const [dynamicCareerPaths, setDynamicCareerPaths] = useState<CareerPath[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCareerPaths = async () => {
      try {
        setIsLoading(true)
        const paths = await dashboardService.getCareerPaths()
        setDynamicCareerPaths(paths)
      } catch (err) {
        console.error('Failed to load career paths:', err)
        setError('Real-time career paths are currently unavailable. Showing last available data.')
        // dynamicCareerPaths will remain whatever it was from the DB (handled by service)
      } finally {
        setIsLoading(false)
      }
    }

    loadCareerPaths()
  }, [])

  if (isLoading) {
    return (
      <section id="careers" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
            Trending{" "}
            <span className="bg-gradient-text bg-clip-text text-transparent">
              Careers in Kenya
            </span>
          </h2>
            <p className="text-xl text-foreground-muted max-w-3xl mx-auto">
              Explore high-demand career paths in Kenya's evolving job market, 
              with real-time insights on demand, salaries, and growth projections.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="bg-gradient-surface border-card-border p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                  </div>
                  <div className="h-10 bg-muted rounded animate-pulse"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="careers" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="careers" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Trending{" "}
            <span className="bg-gradient-text bg-clip-text text-transparent">
              Careers in Kenya
            </span>
          </h2>
          <p className="text-xl text-foreground-muted max-w-3xl mx-auto">
            Explore high-demand career paths in Kenya's evolving job market, 
            with real-time insights on demand, salaries, and growth projections.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dynamicCareerPaths.slice(0, 3).map((career) => (
            <Card 
              key={career.id}
              className="bg-gradient-surface border-card-border hover:shadow-card transition-all duration-300 group overflow-hidden flex flex-col"
            >
              {/* Image Section */}
              <div className="relative h-48 w-full overflow-hidden bg-muted">
                <img 
                  src={career.image_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?fit=crop&w=800&q=80'} 
                  alt={career.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-2 drop-shadow-md">
                    {career.title}
                  </h3>
                  <Badge className={`backdrop-blur-md whitespace-nowrap ml-2 ${getDemandColor(career.demand_level)} border-none shadow-sm`}>
                    {career.demand_level}
                  </Badge>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <p className="text-foreground-muted text-sm line-clamp-3">
                  {career.description}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-foreground-muted" />
                      <span className="text-sm text-foreground-muted">Salary Range</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{career.salary_range}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-foreground-muted" />
                      <span className="text-sm text-foreground-muted">Growth Rate</span>
                    </div>
                    <span className="text-sm font-medium text-success">{career.growth_percentage}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm text-foreground-muted">Key Skills:</span>
                  <div className="flex flex-wrap gap-2">
                    {career.skills_required.map((skill, skillIndex) => (
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
                
                <div className="mt-auto pt-4">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between hover:bg-surface group-hover:text-primary"
                    onClick={() => window.location.href = '/careers'}
                  >
                    Explore Path
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            onClick={() => window.location.href = '/careers'}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow px-10"
          >
            Explore All Careers
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CareerPaths;