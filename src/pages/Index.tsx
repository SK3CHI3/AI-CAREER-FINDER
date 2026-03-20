import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import CareerPaths from "@/components/CareerPaths";
import GuestAIChat from "@/components/GuestAIChat";
import Footer from "@/components/Footer";
import FeatureShowcase from "@/components/FeatureShowcase";
import Testimonials from "@/components/Testimonials";
import BackgroundGradient from "@/components/BackgroundGradient";
import StatsPartnersSection from "@/components/StatsPartnersSection.tsx";
import CallingCard from "@/components/CallingCard";

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
      <Helmet>
        <title>CareerGuide AI | Kenya's #1 Career Guidance for CBE & CBC</title>
        <meta name="description" content="Empower Kenyan students with CareerGuide AI. We offer RIASEC assessments, career matching, and pathway synchronization for Junior and Senior secondary schools under the CBE curriculum." />
        <meta name="keywords" content="Career guidance Kenya, CBC Kenya, CBE curriculum, AI career matching, Kenyan schools, TVET pathways" />
        <link rel="canonical" href="https://careerguide-ai.com/" />
        {/* Open Graph / LLM indexing support */}
        <meta property="og:title" content="CareerGuide AI - The Future of Career Guidance in Kenya" />
        <meta property="og:description" content="AI-powered career guidance aligned with Kenya's Competency-Based Education framework." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <BackgroundGradient />
      <Navigation />
      <main>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Hero />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <StatsPartnersSection />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <FeatureShowcase />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <Testimonials />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <CareerPaths />
        </motion.div>

        <div id="guest-chat" className="guest-chat-section">
          <GuestAIChat />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <CallingCard />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
