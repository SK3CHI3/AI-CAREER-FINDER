import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Bot, User, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { aiCareerService, type ChatMessage, type UserContext } from "@/lib/ai-service";
import { supabase } from "@/lib/supabase";

const AIChat = () => {
  const { user, profile } = useAuth();
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<UserContext>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to clean markdown formatting from AI responses
  const cleanMarkdownFormatting = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** bold markers
      .replace(/\*(.*?)\*/g, '$1')     // Remove * italic markers
      .replace(/#{1,6}\s/g, '')        // Remove # headers
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Remove code blocks
      .trim();
  };

  // Initialize user context and conversation
  useEffect(() => {
    if (user && profile && !isInitialized) {
      initializeChat();
    }
  }, [user, profile, isInitialized]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const initializeChat = async () => {
    try {
      // Load user context from student profile
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      const context: UserContext = {
        name: profile?.full_name || undefined,
        schoolLevel: studentProfile?.school_level,
        currentGrade: studentProfile?.current_grade || undefined,
        subjects: studentProfile?.cbe_subjects || studentProfile?.subjects || undefined,
        interests: studentProfile?.career_interests || studentProfile?.interests || undefined,
        careerGoals: studentProfile?.career_goals || undefined,
        assessmentResults: studentProfile?.assessment_scores
      };

      setUserContext(context);

      // Load conversation history
      if (user?.id) {
        const history = await aiCareerService.loadConversationHistory(user.id);
        if (history.length > 0) {
          setConversation(history);
        } else {
          // Start with welcome message
          const welcomeMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Habari yako, ${context.name ? context.name.split(' ')[0] : 'there'}! 👋

I'm your AI career counselor, specialized in Kenya's CBE education system. I'm here to help you discover your perfect career path based on your interests, abilities, and goals.

${context.schoolLevel ? `I see you're in ${context.schoolLevel} education` : 'I\'d love to learn more about your educational background'}${context.currentGrade ? ` (Grade ${context.currentGrade})` : ''}.

To give you the best guidance, let's start with one simple question:

What subjects do you enjoy most in your current studies? 🎯`,
            timestamp: new Date()
          };
          setConversation([welcomeMessage]);
        }
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setError('Failed to initialize chat. Please refresh the page.');
    }
  }

  const handleSend = async () => {
    if (!message.trim() || isLoading || !user) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiCareerService.sendMessage(
        userMessage.content,
        conversation,
        userContext
      );

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: cleanMarkdownFormatting(response),
        timestamp: new Date()
      };

      const updatedConversation = [...conversation, userMessage, assistantMessage];
      setConversation(updatedConversation);

      // Save conversation
      await aiCareerService.saveConversation(user.id, updatedConversation);

    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to chat with your AI career counselor.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Chat with Your{" "}
          <span className="bg-gradient-text bg-clip-text text-transparent">
            AI Career Counselor
          </span>
        </h2>
        <p className="text-foreground-muted max-w-2xl mx-auto">
          Get personalized career guidance based on Kenya's education system and job market.
        </p>
      </div>

      <Card className="bg-gradient-surface border-card-border shadow-elevated">
        {/* Chat Header */}
        <CardHeader className="border-b border-card-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">CareerPath AI Assistant</CardTitle>
                <CardDescription>Powered by DeepSeek R1 - Advanced reasoning for career guidance</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Online
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* Chat Messages */}
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-6">
            <div className="space-y-6">
              {conversation.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} space-x-3`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-3'
                        : 'bg-gradient-primary text-primary-foreground mr-3'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-card-border'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-background border border-card-border p-4 rounded-2xl">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-foreground-muted">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        {/* Chat Input */}
        <div className="p-6 border-t border-card-border">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-4">
            <Input
              placeholder="Ask about career paths, subjects, university programs, job prospects..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={isLoading}
              className="bg-background border-card-border"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-6"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-foreground-muted flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by DeepSeek R1 - Advanced AI reasoning for career guidance
            </p>
            {userContext.name && (
              <Badge variant="outline" className="text-xs">
                Profile: {userContext.schoolLevel || 'Student'} {userContext.currentGrade && `Grade ${userContext.currentGrade}`}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIChat;