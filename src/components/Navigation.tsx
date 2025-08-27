import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Bot, TrendingUp, Users, BookOpen } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                CareerPath AI
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-foreground-muted hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#careers" className="text-foreground-muted hover:text-foreground transition-colors">
                Career Paths
              </a>
              <a href="#about" className="text-foreground-muted hover:text-foreground transition-colors">
                About
              </a>
              <a href="#contact" className="text-foreground-muted hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-foreground-muted hover:text-foreground">
              Sign In
            </Button>
            <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow">
              Start Free Assessment
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground-muted"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-surface rounded-lg mt-2 shadow-card">
              <a
                href="#features"
                className="block px-3 py-2 text-foreground-muted hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Features
              </a>
              <a
                href="#careers"
                className="block px-3 py-2 text-foreground-muted hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Career Paths
              </a>
              <a
                href="#about"
                className="block px-3 py-2 text-foreground-muted hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </a>
              <a
                href="#contact"
                className="block px-3 py-2 text-foreground-muted hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </a>
              <div className="pt-4 border-t border-card-border">
                <Button variant="ghost" className="w-full justify-start text-foreground-muted mb-2">
                  Sign In
                </Button>
                <Button className="w-full bg-gradient-primary text-primary-foreground">
                  Start Free Assessment
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;