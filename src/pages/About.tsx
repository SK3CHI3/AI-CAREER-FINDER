import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BackgroundGradient from "@/components/BackgroundGradient";
import { Users, Target, BookOpen } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen text-foreground relative overflow-x-hidden pt-20">
      <BackgroundGradient />
      <Navigation />
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Empowering Kenya's {" "}
            <span className="bg-gradient-text bg-clip-text text-transparent">
              Future Leaders
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-foreground-muted max-w-3xl mx-auto mb-10 leading-relaxed">
            CareerGuide AI is on a mission to democratize career counseling in Kenya. We bridge the gap between the new Competency-Based Education (CBE) curriculum and real-world career opportunities using advanced Artificial Intelligence.
          </p>
        </section>

        {/* Vision/Mission Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-surface border border-card-border p-8 rounded-2xl shadow-elevated text-center transform transition-all hover:scale-105">
              <div className="w-16 h-16 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Our Mission</h3>
              <p className="text-foreground-muted">
                To provide accessible, personalized, and data-driven career guidance to every Kenyan student, regardless of their background or location.
              </p>
            </div>

            <div className="bg-gradient-surface border border-card-border p-8 rounded-2xl shadow-elevated text-center transform transition-all hover:scale-105">
              <div className="w-16 h-16 mx-auto bg-secondary/20 rounded-2xl flex items-center justify-center mb-6 text-secondary">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">The CBC Advantage</h3>
              <p className="text-foreground-muted">
                We deeply integrate with Kenya's CBE curriculum, mapping student strengths directly to learning areas to ensure realistic and actionable pathways.
              </p>
            </div>

            <div className="bg-gradient-surface border border-card-border p-8 rounded-2xl shadow-elevated text-center transform transition-all hover:scale-105">
              <div className="w-16 h-16 mx-auto bg-accent/20 rounded-2xl flex items-center justify-center mb-6 text-accent">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">For Schools</h3>
              <p className="text-foreground-muted">
                We empower teachers and administrators with powerful insights, making career guidance manageable and scalable for the thousands of students in their care.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="bg-muted/30 border border-card-border rounded-3xl p-8 sm:p-12">
            <h2 className="text-3xl font-bold mb-6">Why CareerGuide AI?</h2>
            <div className="space-y-6 text-foreground-muted leading-relaxed">
              <p>
                In many Kenyan schools, the ratio of students to career counselors is staggeringly high. This leaves thousands of talented learners graduating without a clear understanding of where their passions intersect with their capabilities and the job market.
              </p>
              <p>
                With the introduction of the Competency-Based Curriculum (CBC), students face diverse pathways earlier in their education. Navigating these pathways requires nuanced guidance. 
              </p>
              <p>
                CareerGuide AI was built as a scalable solution. By leveraging AI trained specifically on the Kenyan educational context, we provide the personalized, 24/7 counseling experience of a dedicated mentor to every student with internet access. We don't just suggest jobs; we build holistic pathways from today's classroom to tomorrow's career.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
