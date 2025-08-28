import { Bot, Mail, Phone, MapPin, Twitter, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-surface/50 backdrop-blur-sm border-t border-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-text bg-clip-text text-transparent">
                CareerPath AI
              </span>
            </div>
            <p className="text-foreground-muted leading-relaxed">
              Empowering Kenyan students with AI-driven career guidance 
              tailored for the Competency-Based Education system.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="text-foreground-muted hover:text-primary">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-foreground-muted hover:text-primary">
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-foreground-muted hover:text-primary">
                <Github className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-foreground-muted hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#" className="text-foreground-muted hover:text-foreground transition-colors">Career Paths</a></li>
              <li><a href="#" className="text-foreground-muted hover:text-foreground transition-colors">AI Assessment</a></li>
              <li><a href="#" className="text-foreground-muted hover:text-foreground transition-colors">Learning Roadmaps</a></li>
              <li><a href="#" className="text-foreground-muted hover:text-foreground transition-colors">Market Insights</a></li>
            </ul>
          </div>
          
          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-foreground-muted hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="text-foreground-muted hover:text-foreground transition-colors">Our Mission</a></li>
              <li><a href="#" className="text-foreground-muted hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="text-foreground-muted hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="text-foreground-muted hover:text-foreground transition-colors">Press Kit</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-foreground-muted" />
                <a href="mailto:hello@careerpathai.co.ke" className="text-foreground-muted hover:text-foreground transition-colors">
                  hello@careerpathai.co.ke
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-foreground-muted" />
                <a href="tel:+254700000000" className="text-foreground-muted hover:text-foreground transition-colors">
                  +254 700 000 000
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-foreground-muted mt-0.5" />
                <span className="text-foreground-muted">
                  Nairobi, Kenya
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-card-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-foreground-muted text-sm">
              © 2024 CareerPath AI. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-foreground-muted hover:text-foreground text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-foreground-muted hover:text-foreground text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-foreground-muted hover:text-foreground text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;