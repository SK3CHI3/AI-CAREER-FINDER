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
          <div className="bg-muted/30 border border-card-border rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl font-bold mb-6">Why CareerGuide AI?</h2>
            <div className="space-y-6 text-foreground-muted leading-relaxed max-w-2xl mx-auto">
              <p>
                In many Kenyan schools, the ratio of students to career counselors is staggeringly high. CareerGuide AI was built as a scalable solution. 
              </p>
              <p>
                By leveraging AI trained specifically on the Kenyan educational context, we provide the personalized, 24/7 counseling experience of a dedicated mentor to every student with internet access.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">The Team Behind the Mission</h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              Dedicated professionals committed to transforming the educational landscape in Kenya through innovation and empathy.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { 
                name: "Omollo Victor", 
                role: "Lead Dev & Founder", 
                bio: "Full-stack engineer with a vision to make career guidance accessible to every Kenyan student through technology.",
                socials: { x: "#", linkedin: "#" }
              },
              { 
                name: "Christabel Nekesa", 
                role: "Data Engineer & Co-founder", 
                bio: "Specializing in educational data structures to ensure our AI models are perfectly aligned with CBE learning outcomes.",
                socials: { x: "#", linkedin: "#" }
              },
              { 
                name: "Precious Diana", 
                role: "CTO", 
                bio: "Leading our technical strategy and scaling our infrastructure to support thousands of concurrent student assessments.",
                socials: { x: "#", linkedin: "#" }
              }
            ].map((member, i) => (
              <div key={i} className="group relative bg-gradient-surface border border-card-border p-8 rounded-[3rem] transition-all hover:scale-[1.02] hover:shadow-2xl hover:border-primary/50 text-center">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-primary rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative w-full h-full bg-muted rounded-full border-2 border-card-border overflow-hidden flex items-center justify-center text-primary font-black text-3xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                <p className="text-primary font-semibold text-sm mb-4 uppercase tracking-widest">{member.role}</p>
                <p className="text-foreground-muted text-sm leading-relaxed mb-8 px-4">{member.bio}</p>
                
                <div className="flex justify-center gap-4">
                  <a href={member.socials.x} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-foreground-muted hover:bg-black hover:text-white transition-all transform hover:-translate-y-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.25h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href={member.socials.linkedin} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-foreground-muted hover:bg-[#0077b5] hover:text-white transition-all transform hover:-translate-y-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.25 6.5 1.75 1.75 0 016.5 8.25zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.4 1.05 3.4 3.85z"/></svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
