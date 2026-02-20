import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Bot, User, Sparkles, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { aiCareerService, type ChatMessage, type UserContext } from "@/lib/ai-service";
import { supabase } from "@/lib/supabase";
import type { Database } from '@/types/supabase';

const AIChat = () => {
  const { user, profile } = useAuth();
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<UserContext>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Load conversation from localStorage on component mount
  useEffect(() => {
    if (user?.id) {
      const savedConversation = localStorage.getItem(`ai_chat_${user.id}`);
      if (savedConversation) {
        try {
          const parsedConversation = JSON.parse(savedConversation);
          // Convert timestamp strings back to Date objects
          const conversationWithDates = parsedConversation.map((msg: ChatMessage) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setConversation(conversationWithDates);
          console.log('✅ Loaded conversation from localStorage');
        } catch (error) {
          console.error('Failed to parse saved conversation:', error);
        }
      }
    }
  }, [user?.id]);

  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    if (user?.id && conversation.length > 0) {
      localStorage.setItem(`ai_chat_${user.id}`, JSON.stringify(conversation));
      console.log('💾 Saved conversation to localStorage');
    }
  }, [conversation, user?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const initializeChat = async () => {
    try {
      // Load user context from student profile
      const { data: studentProfileRaw } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      const studentProfile = studentProfileRaw as Database['public']['Tables']['profiles']['Row'] | null;

      const context: UserContext = {
        name: profile?.full_name || undefined,
        schoolLevel: studentProfile ? studentProfile.school_level || undefined : undefined,
        currentGrade: studentProfile ? studentProfile.current_grade || undefined : undefined,
        subjects: studentProfile ? (studentProfile.subjects || undefined) : undefined,
        interests: studentProfile ? (studentProfile.interests || undefined) : undefined,
        careerGoals: studentProfile ? studentProfile.career_goals || undefined : undefined,
        assessmentResults: studentProfile ? (studentProfile.assessment_results as any) || undefined : undefined // fallback as any if not typed
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

  // Function to refresh/clear the chat
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Clear the conversation
      setConversation([]);
      setError(null);
      
      // Clear localStorage
      if (user?.id) {
        localStorage.removeItem(`ai_chat_${user.id}`);
        console.log('🗑️ Cleared conversation from localStorage');
      }
      
      // Re-initialize the chat
      setIsInitialized(false);
      await initializeChat();
      
      console.log('Chat refreshed - conversation cleared and re-initialized');
    } catch (error) {
      console.error('Failed to refresh chat:', error);
      setError('Failed to refresh chat. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

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

      // Quick assessment - don't save conversation to database
      console.log('Quick assessment chat - conversation not saved to database');

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Show user-friendly error messages
      let errorMessage = 'Failed to send message. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('Network connection failed')) {
          errorMessage = 'Network connection failed. Please check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="w-full max-w-2xl px-2 sm:mx-auto sm:p-6 p-2">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to chat with your AI career counselor.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fatal init error: show clear message and retry so the UI is not stuck
  if (error && !isInitialized) {
    return (
      <div className="w-full max-w-2xl px-2 sm:mx-auto sm:p-6 p-2">
        <Card className="bg-gradient-surface border-card-border shadow-elevated">
          <CardContent className="p-6">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              onClick={() => {
                setError(null);
                initializeChat();
              }}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl px-2 sm:mx-auto sm:p-6 p-2">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4">
          Chat with Your{" "}
          <span className="bg-gradient-text bg-clip-text text-transparent">
            AI Career Counselor
          </span>
        </h2>
        <p className="text-foreground-muted max-w-2xl mx-auto text-sm sm:text-base">
          Quick AI assessment – Get personalized career guidance based on Kenya's education system and job market.
          <span className="text-blue-600 font-medium"> Conversations persist during your session but are not saved to database.</span>
        </p>
      </div>

      <Card className="bg-gradient-surface border-card-border shadow-elevated">
        {/* Chat Header */}
        <CardHeader className="border-b border-card-border sm:p-6 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">CareerPath AI Assistant</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Quick Assessment • Powered by DeepSeek R1 • Session-based (survives page refresh)</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-xs min-h-[38px]"
              >
                {isRefreshing ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-1" />
                )}
                Refresh
              </Button>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                Online
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* Chat Messages */}
        <CardContent className="p-0 sm:p-6 p-3">
          <ScrollArea className="h-80 sm:h-96 p-2 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {conversation.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[90vw] sm:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2 sm:gap-3`}>
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-2 sm:ml-3'
                        : 'bg-gradient-primary text-primary-foreground mr-2 sm:mr-3'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`p-3 sm:p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-card-border'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1 sm:mt-2">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-background border border-card-border p-3 sm:p-4 rounded-2xl">
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
        <div className="border-t border-card-border sm:p-6 p-3">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Input
              placeholder="Ask about career paths, subjects, university programs, job prospects..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={isLoading}
              className="bg-background border-card-border w-full mb-2 sm:mb-0 sm:mr-4 min-h-[44px] text-base"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground w-full sm:w-auto px-4 sm:px-6 min-h-[44px]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 sm:mt-3">
            <p className="text-xs sm:text-xs text-foreground-muted flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by DeepSeek R1 - Advanced AI reasoning for career guidance
            </p>
            {userContext.name && (
              <Badge variant="outline" className="text-xs mt-2 sm:mt-0">
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