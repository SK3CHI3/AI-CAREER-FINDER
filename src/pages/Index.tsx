import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import CareerPaths from "@/components/CareerPaths";
import GuestAIChat from "@/components/GuestAIChat";
import Footer from "@/components/Footer";
import Explainers from "@/components/Explainers";
import FeatureShowcase from "@/components/FeatureShowcase";
import Testimonials from "@/components/Testimonials";
import LogosBand from "@/components/LogosBand";
import BackgroundGradient from "@/components/BackgroundGradient";

const Index = () => {
  const location = useLocation();
  const scrollTo = (location.state as { scrollTo?: string })?.scrollTo;

  useEffect(() => {
    if (scrollTo) {
      const el = document.getElementById(scrollTo);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrollTo]);

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden relative">
      <BackgroundGradient />
      <Navigation />
      <main>
        <Hero />
        <FeatureShowcase />
        <Explainers />
        <Testimonials />
        <LogosBand />
        <CareerPaths />
        <div id="guest-chat" className="guest-chat-section">
          <GuestAIChat />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
