import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles } from "lucide-react";

const sampleConversation = [
  {
    type: "bot",
    message: "Hi! I'm your AI career counselor. I'm here to help you navigate Kenya's CBE system and find your perfect career path. What grade are you in?"
  },
  {
    type: "user",
    message: "I'm in Grade 10, and I'm really interested in technology but also love biology."
  },
  {
    type: "bot",
    message: "That's a fantastic combination! Biotechnology and health technology are rapidly growing fields in Kenya. Based on your interests, I'd recommend exploring: Biomedical Engineering, Health Informatics, or Agricultural Biotechnology. Would you like to know more about job prospects and salary ranges for these fields?"
  }
];

const AIChat = () => {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState(sampleConversation);

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Add user message
    setConversation(prev => [...prev, { type: "user", message }]);
    
    // Simulate AI response
    setTimeout(() => {
      setConversation(prev => [...prev, {
        type: "bot",
        message: "I understand your interest! Let me analyze your profile and provide personalized recommendations based on current market trends in Kenya..."
      }]);
    }, 1000);
    
    setMessage("");
  };

  return (
    <section className="py-20 bg-background-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Chat with Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              AI Career Counselor
            </span>
          </h2>
          <p className="text-xl text-foreground-muted max-w-3xl mx-auto">
            Get instant, personalized career guidance. Our AI understands CBE structure, 
            Kenyan job market, and your unique interests to provide tailored advice.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-surface border-card-border shadow-elevated">
            {/* Chat Header */}
            <div className="p-6 border-b border-card-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">CareerPath AI Assistant</h3>
                  <p className="text-sm text-foreground-muted">Your personal career counselor</p>
                </div>
                <div className="ml-auto flex items-center space-x-1">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-xs text-foreground-muted">Online</span>
                </div>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
              {conversation.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'} space-x-3`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.type === 'user' 
                        ? 'bg-primary text-primary-foreground ml-3' 
                        : 'bg-surface mr-3'
                    }`}>
                      {msg.type === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className={`p-4 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface border border-card-border'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Chat Input */}
            <div className="p-6 border-t border-card-border">
              <div className="flex space-x-4">
                <Input
                  placeholder="Ask about career paths, CBE subjects, job market trends..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="bg-surface border-card-border"
                />
                <Button 
                  onClick={handleSend}
                  className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-foreground-muted mt-2 flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                AI responses are powered by real-time job market data
              </p>
            </div>
          </Card>
          
          <div className="text-center mt-8">
            <Button 
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
            >
              Start Full Assessment
            </Button>
            <p className="text-sm text-foreground-muted mt-2">
              Get comprehensive career analysis with personalized reports
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIChat;