import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CareerPaths from "@/components/CareerPaths";
import AIChat from "@/components/AIChat";
import GuestAIChat from "@/components/GuestAIChat";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen text-foreground overflow-x-hidden" style={{ background: 'var(--gradient-homepage)' }}>
      <Navigation />
      <main>
        <Hero />
        <Features />
        <CareerPaths />
        <div id="guest-chat">
          <GuestAIChat />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
