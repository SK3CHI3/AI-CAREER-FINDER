import { useNavigate, useLocation } from "react-router-dom";
import { Bot, Mail, Phone, MapPin, Twitter, Linkedin, Github, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer id="contact" className="bg-surface/50 backdrop-blur-sm border-t border-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center h-[40px] overflow-visible hover:opacity-80 transition-opacity"
            >
              <img
                src="/logos/CareerGuide_Logo.webp"
                alt="CareerGuide AI"
                width="160"
                height="40"
                className="h-[60px] w-auto -mt-2 -ml-2"
              />
            </button>

            <p className="text-foreground-muted text-sm leading-relaxed">
              Empowering Kenya's next generation with AI-driven career guidance aligned with the CBE framework.
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
              <li><button onClick={() => scrollToSection('features')} className="text-foreground-muted hover:text-foreground transition-colors text-left">Features</button></li>
              <li><button onClick={() => scrollToSection('careers')} className="text-foreground-muted hover:text-foreground transition-colors text-left">Career Paths</button></li>
              <li><button onClick={() => navigate('/quick-assessment')} className="text-foreground-muted hover:text-foreground transition-colors text-left">AI Assessment</button></li>
              <li><button onClick={() => scrollToSection('about')} className="text-foreground-muted hover:text-foreground transition-colors text-left">Learning Roadmaps</button></li>
              <li><button onClick={() => scrollToSection('careers')} className="text-foreground-muted hover:text-foreground transition-colors text-left">Market Insights</button></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Company</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/about')} className="text-foreground-muted hover:text-foreground transition-colors text-left">About Us</button></li>
              <li><button onClick={() => navigate('/about')} className="text-foreground-muted hover:text-foreground transition-colors text-left">Our Mission</button></li>
              <li><button onClick={() => navigate('/faq')} className="text-foreground-muted hover:text-foreground transition-colors text-left">FAQ</button></li>
              <li><button onClick={() => scrollToSection('contact')} className="text-foreground-muted hover:text-foreground transition-colors text-left">Contact Us</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-foreground-muted" />
                <a href="mailto:hello@careerguideai.co.ke" className="text-foreground-muted hover:text-foreground transition-colors">
                  hello@careerguideai.co.ke
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-foreground-muted" />
                <a href="tel:+254700000000" className="text-foreground-muted hover:text-foreground transition-colors">
                  +254 714525667
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
              © {new Date().getFullYear()} CareerGuide AI. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('trigger-pwa-install'))}
                className="text-foreground-muted hover:text-primary text-sm transition-colors flex items-center gap-2"
              >
                <Download className="w-3 h-3" />
                Install App
              </button>
              <button onClick={() => navigate('/privacy')} className="text-foreground-muted hover:text-foreground text-sm transition-colors">
                Privacy Policy
              </button>
              <button onClick={() => navigate('/terms')} className="text-foreground-muted hover:text-foreground text-sm transition-colors">
                Terms of Service
              </button>
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
