import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import CareerPaths from "@/components/CareerPaths";
import QuickAssessmentSection from "@/components/QuickAssessmentSection";
import Footer from "@/components/Footer";
import FeatureShowcase from "@/components/FeatureShowcase";
import Testimonials from "@/components/Testimonials";
import BackgroundGradient from "@/components/BackgroundGradient";
import StatsPartnersSection from "@/components/StatsPartnersSection.tsx";
import CallingCard from "@/components/CallingCard";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPathForRole } from "@/types/roles";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user && profile) {
      const dashboardPath = getDashboardPathForRole(profile.role as "student" | "admin" | "school" | "teacher");
      navigate(dashboardPath, { replace: true });
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (location.state && (location.state as any).scrollTo) {
      const sectionId = (location.state as any).scrollTo;
      // Add a small delay to ensure the page has rendered
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
      // Clear the state so it doesn't scroll again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden relative">
      <Helmet>
        <title>CareerGuide AI | Kenya's #1 Career Guidance for CBE & CBC</title>
        <meta name="description" content="Empower Kenyan students with CareerGuide AI. We offer RIASEC assessments, career matching, and pathway synchronization for Junior and Senior secondary schools under the CBE curriculum." />
        <meta name="keywords" content="Career guidance Kenya, CBC Kenya, CBE curriculum, AI career matching, Kenyan schools, TVET pathways" />
        <link rel="canonical" href="https://careerguideai.co.ke/" />
        {/* Open Graph / LLM indexing support */}
        <meta property="og:title" content="CareerGuide AI - The Future of Career Guidance in Kenya" />
        <meta property="og:description" content="AI-powered career guidance aligned with Kenya's Competency-Based Education framework." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://careerguideai.co.ke/" />
        <meta property="og:image" content="https://careerguideai.co.ke/logos/CareerGuide_Logo.png" />
        
        {/* Organization JSON-LD for AI & Google Brand Recognition */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "CareerGuide AI",
            "url": "https://careerguideai.co.ke",
            "logo": "https://careerguideai.co.ke/logos/CareerGuide_Logo.png",
            "description": "Kenya's leading AI-powered career guidance platform for the Competency-Based Curriculum.",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Nairobi",
              "addressCountry": "Kenya"
            },
            "sameAs": [
              "https://twitter.com/CareerGuideAI",
              "https://linkedin.com/company/careerguideai"
            ]
          })}
        </script>
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
          <QuickAssessmentSection />
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
