import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Bot, User, Sparkles, Loader2, AlertCircle, Download, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";
import { aiCareerService, type ChatMessage } from "@/lib/ai-service";
import { ReportGenerator, type GuestProfile } from "@/lib/report-generator";

// GuestProfile is now imported from report-generator

const MOCK_CHAT_SEQUENCE = [
  { role: 'bot', text: "Karibu! I'm CareerGuide AI. Let's find your perfect CBE pathway. What subjects do you enjoy most at school?" },
  { role: 'user', text: "I really enjoy Computer Science and Art & Design." },
  { role: 'bot', text: "That's a powerful combination! You could explore Software Engineering, Digital Design, or Animation." },
  { role: 'user', text: "Digital Design sounds interesting! What grades do I need?" },
  { role: 'bot', text: "For Digital Design, focus on excelling in Mathematics, Art, and Computer Studies. Would you like to see a full pathway map?" }
];

const GuestAIChat = () => {
  const navigate = useNavigate();
  const [mockStep, setMockStep] = useState(0);

  // Auto-play the mock chat
  useEffect(() => {
    const timer = setInterval(() => {
      setMockStep((prev) => (prev >= MOCK_CHAT_SEQUENCE.length ? 0 : prev + 1));
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="assessment" className="py-24 relative overflow-hidden bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Mock Chat Preview (Animation) */}
          <div className="order-2 lg:order-1 relative">
            {/* Decorative Background Elements */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
            
            <div className="relative w-full max-w-md mx-auto h-[500px] bg-background rounded-[2.5rem] p-6 shadow-2xl border border-card-border overflow-hidden flex flex-col">
              {/* Mock Chat Header */}
              <div className="flex-shrink-0 flex items-center gap-3 mb-6 pb-4 border-b border-card-border">
                <div className="w-10 h-10 rounded-full bg-gradient-primary text-white flex items-center justify-center shadow-glow">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground leading-tight">CareerGuide AI</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[10px] text-foreground-muted font-medium uppercase tracking-wider">Online & Helping</p>
                  </div>
                </div>
              </div>

              {/* Looping Messages */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col justify-end space-y-4">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {MOCK_CHAT_SEQUENCE.slice(0, mockStep === 0 ? 0 : mockStep).map((msg, idx) => (
                      <motion.div
                        key={`teaser-${idx}`}
                        layout
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`p-4 text-sm shadow-sm max-w-[85%] leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-none' 
                              : 'bg-muted/30 border border-card-border rounded-2xl rounded-tl-none text-foreground'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {((mockStep < MOCK_CHAT_SEQUENCE.length && MOCK_CHAT_SEQUENCE[mockStep]?.role === 'bot') || mockStep === 0) && (
                      <motion.div
                        key="typing-indicator"
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start pt-2"
                      >
                        <div className="bg-muted/30 border border-card-border rounded-2xl rounded-tl-none p-4 w-16 h-10 flex items-center justify-center gap-1">
                          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-1.5 h-1.5 bg-foreground-muted rounded-full" />
                          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-foreground-muted rounded-full" />
                          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-foreground-muted rounded-full" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Text & CTA */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
              <Sparkles className="w-4 h-4" />
              <span>AI-POWERED ASSISTANCE</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-[1.1] tracking-tight">
              Discover paths your <br />
              <span className="bg-gradient-text bg-clip-text text-transparent italic pr-2">future self</span> 
              will thank you for.
            </h2>
            
            <p className="text-xl text-foreground-muted leading-relaxed max-w-xl font-medium">
              Take a 2-minute chat-based assessment to uncover careers that match your unique personality and CBE learning areas.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Clear CBE pathway recommendations",
                "Downloadable personalized career PDF",
                "No sign-up required to see matches",
                "Built for Kenyan curriculum"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-foreground/80 font-semibold text-sm">{benefit}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={() => navigate('/quick-assessment')}
                size="lg" 
                className="bg-gradient-primary hover:opacity-95 text-primary-foreground text-lg px-10 py-7 rounded-2xl shadow-glow hover:-translate-y-1 transition-all duration-300 font-bold group"
              >
                <span>Start Chatting Now</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default GuestAIChat;
