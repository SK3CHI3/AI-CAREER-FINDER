import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CareerPaths from "@/components/CareerPaths";
import AIChat from "@/components/AIChat";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navigation />
      <main>
        <Hero />
        <Features />
        <CareerPaths />
        <AIChat />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
