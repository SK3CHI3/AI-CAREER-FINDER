import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Bot, User, Sparkles, Loader2, AlertCircle, Download, ArrowRight } from "lucide-react";
import { aiCareerService, type ChatMessage } from "@/lib/ai-service";
import { ReportGenerator, type GuestProfile } from "@/lib/report-generator";

// GuestProfile is now imported from report-generator

const GuestAIChat = () => {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestProfile, setGuestProfile] = useState<GuestProfile>({});
  const [showFinishCTA, setShowFinishCTA] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [connectionTest, setConnectionTest] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll chat area to bottom
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  };

  // Auto-scroll chat area when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  // Function to clean markdown formatting from AI responses
  const cleanMarkdownFormatting = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** bold markers
      .replace(/\*(.*?)\*/g, '$1')     // Remove * italic markers
      .replace(/#{1,6}\s/g, '')        // Remove # headers
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Remove code blocks
      .trim();
  };

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Karibu to CareerPath AI! 🎉

I'm your friendly career counselor, here to help you discover your perfect career path through Kenya's CBE system!

What you'll get:
✅ Personalized career matches based on your interests
✅ CBE pathway recommendations for your grade level
✅ University & technical college suggestions
✅ Professional career report (downloadable!)

This will be fun and easy - I'll ask you simple questions one by one, and we'll build your career profile together!

Let's start with the basics - what's your name? 😊`,
      timestamp: new Date()
    };
    setConversation([welcomeMessage]);
  }, []);

  const createGuestSystemPrompt = (): string => {
    return `You are CareerPath AI, Kenya's most engaging career counselor! You're conducting a FREE quick assessment to help students discover their perfect career path through Kenya's CBE system.

CURRENT GUEST PROFILE:
${Object.entries(guestProfile).map(([key, value]) =>
  value ? `- ${key}: ${Array.isArray(value) ? value.join(', ') : value}` : ''
).filter(Boolean).join('\n')}

YOUR MISSION: Guide them through a structured, fun conversation to build their career profile.

CONVERSATION FLOW (ONE QUESTION AT A TIME):
1. **Welcome & Name** - "Karibu! What's your name?"
2. **Education Level** - Current grade/level in CBE system
3. **Interests** - What activities/fields excite them most?
4. **CBE Subjects** - Which subjects do they enjoy?
5. **Work Style** - Practical vs Academic vs Creative vs Business?
6. **Dream Environment** - Office, Outdoor, Tech, Digital?
7. **Aspirations** - What's their dream job/goal?
8. **Provide Mini-Report** - Give 2-3 career matches with explanations

FORMATTING STYLE - CRITICAL:
- Write in clean, natural text - NO markdown symbols like ** or ##
- Start responses with "Habari yako, [Name]! 👋" (clean text, no **)
- Use emojis naturally: 🎯, 💼, 🚀, 🌱
- Use numbered options: 1️⃣, 2️⃣, 3️⃣
- Include encouraging phrases naturally: "Fantastic!", "That's exciting!"
- End each response with ONE clear question

EXAMPLE RESPONSE FORMAT:
Habari yako, Sarah! 👋

That's a beautiful name! I'm excited to help you discover your perfect career path through Kenya's CBE system.

Next question:
What grade are you currently in?
(Choose one)
1️⃣ Primary (Grades 1-6)
2️⃣ Junior Secondary (Grades 7-9)
3️⃣ Senior Secondary (Grades 10-12)
4️⃣ Tertiary/University level

This helps me understand which CBE pathway options are available to you! 🚀

PERSONALITY:
- Enthusiastic and encouraging
- Genuinely curious about their responses
- Use Kenyan context and CBE terminology
- Make it feel like chatting with a friendly mentor
- Build excitement about their future possibilities

CRITICAL RULES:
- Ask ONLY ONE question per response
- Wait for their answer before moving forward
- Make each question feel personal and engaging
- Use proper formatting with emojis and bold text
- Reference Kenya's CBE system and opportunities

CONVERSATION FLOW:
- Continue asking questions naturally until the user decides to finish
- Keep the conversation engaging and personal
- Focus on gathering comprehensive information about their interests, goals, and preferences

Remember: YOU MUST ALWAYS BE CURIOUS TO KNOW THEM. Make this the most engaging career conversation they've ever had!`;
  };

  const extractProfileInfo = (userMessage: string, aiResponse: string) => {
    const message = userMessage.toLowerCase();
    const newProfile = { ...guestProfile };

    // Extract name - more flexible patterns
    if (!newProfile.name) {
      const namePatterns = [
        /(?:my name is|i'm|i am|call me)\s+([a-zA-Z\s]+)/,
        /^([a-zA-Z]+)$/,  // Single word responses to "what's your name"
        /^([a-zA-Z]+\s+[a-zA-Z]+)$/  // Two word names
      ];

      for (const pattern of namePatterns) {
        const match = message.match(pattern);
        if (match && match[1].length > 1 && match[1].length < 30) {
          newProfile.name = match[1].trim().replace(/\b\w/g, l => l.toUpperCase());
          break;
        }
      }
    }

    // Extract grade/education level
    if (!newProfile.grade) {
      const gradePatterns = [
        /grade\s*(\d+)/,
        /form\s*(\d+)/,
        /year\s*(\d+)/,
        /class\s*(\d+)/,
        /(\d+)(?:th|st|nd|rd)?\s*grade/,
        /junior\s*secondary/,
        /senior\s*secondary/,
        /primary/,
        /university/,
        /college/
      ];

      for (const pattern of gradePatterns) {
        const match = message.match(pattern);
        if (match) {
          if (match[1]) {
            newProfile.grade = `Grade ${match[1]}`;
          } else if (message.includes('junior')) {
            newProfile.grade = 'Junior Secondary';
          } else if (message.includes('senior')) {
            newProfile.grade = 'Senior Secondary';
          } else if (message.includes('primary')) {
            newProfile.grade = 'Primary';
          } else if (message.includes('university') || message.includes('college')) {
            newProfile.grade = 'Tertiary';
          }
          break;
        }
      }
    }

    // Extract CBE subjects
    const cbeSubjects = [
      'mathematics', 'math', 'english', 'kiswahili', 'swahili',
      'science', 'biology', 'chemistry', 'physics', 'computer science',
      'geography', 'history', 'business', 'agriculture', 'home science',
      'art', 'music', 'french', 'german', 'arabic', 'literature',
      'economics', 'cre', 'ire', 'hre', 'physical education', 'pe'
    ];

    const mentionedSubjects = cbeSubjects.filter(subject =>
      message.includes(subject) || message.includes(subject.replace(' ', ''))
    );

    if (mentionedSubjects.length > 0) {
      const formattedSubjects = mentionedSubjects.map(subject =>
        subject.replace(/\b\w/g, l => l.toUpperCase())
      );
      newProfile.subjects = [...new Set([...(newProfile.subjects || []), ...formattedSubjects])];
    }

    // Extract interests and career goals
    const interestKeywords = {
      'Technology': ['technology', 'tech', 'coding', 'programming', 'computer', 'software', 'app'],
      'Healthcare': ['medicine', 'doctor', 'nurse', 'health', 'medical', 'hospital'],
      'Business': ['business', 'entrepreneur', 'marketing', 'sales', 'finance'],
      'Engineering': ['engineering', 'building', 'construction', 'mechanical', 'electrical'],
      'Agriculture': ['farming', 'agriculture', 'crops', 'livestock', 'veterinary'],
      'Arts': ['art', 'design', 'creative', 'drawing', 'painting', 'music'],
      'Education': ['teaching', 'teacher', 'education', 'school'],
      'Sports': ['sports', 'football', 'athletics', 'fitness', 'coaching']
    };

    Object.entries(interestKeywords).forEach(([interest, keywords]) => {
      if (keywords.some(keyword => message.includes(keyword))) {
        if (!newProfile.interests?.includes(interest)) {
          newProfile.interests = [...(newProfile.interests || []), interest];
        }
      }
    });

    // Extract work preferences
    if (message.includes('practical') || message.includes('hands-on')) {
      newProfile.strengths = [...(newProfile.strengths || []), 'Practical Work'];
    }
    if (message.includes('creative') || message.includes('artistic')) {
      newProfile.strengths = [...(newProfile.strengths || []), 'Creative Thinking'];
    }
    if (message.includes('research') || message.includes('academic')) {
      newProfile.strengths = [...(newProfile.strengths || []), 'Academic Research'];
    }

    setGuestProfile(newProfile);
  };


  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
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
      const guestContext = {
        name: guestProfile.name,
        schoolLevel: 'secondary' as const,
        currentGrade: guestProfile.grade,
        subjects: guestProfile.subjects,
        interests: guestProfile.interests,
        careerGoals: guestProfile.careerGoals
      };

      console.log('Sending message to AI:', { userMessage: userMessage.content, guestContext });

      // Use the AI service with custom context for guest assessment
      const response = await aiCareerService.sendMessage(
        userMessage.content,
        conversation,
        guestContext
      );

      console.log('AI response received:', response);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: cleanMarkdownFormatting(response),
        timestamp: new Date()
      };

      const updatedConversation = [...conversation, userMessage, assistantMessage];
      setConversation(updatedConversation);

      // Extract profile information from the conversation
      extractProfileInfo(userMessage.content, response);

      // Show "Finish assessment" CTA after 6 user turns (subtle)
      // Complete assessment after 8 user turns
      const userAnswers = updatedConversation.filter(m => m.role === 'user').length;
      if (userAnswers >= 6 && !showFinishCTA) {
        setShowFinishCTA(true);
      }
      if (userAnswers >= 8 && !assessmentComplete) {
        setAssessmentComplete(true);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to connect to AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const finishAssessment = async () => {
    try {
      setIsGeneratingReport(true);
      // Ask AI to produce a concise summary tailored for the PDF
      const guestContext = {
        name: guestProfile.name,
        schoolLevel: 'secondary' as const,
        currentGrade: guestProfile.grade,
        subjects: guestProfile.subjects,
        interests: guestProfile.interests,
        careerGoals: guestProfile.careerGoals
      };

      const summaryPrompt = `Create a concise assessment summary for a Kenyan CBE learner. Output clean paragraphs (no markdown, no lists unless needed). Include:
1) Overview: student context in one paragraph.
2) Top 3 career suggestions with one-line reasoning each.
3) CBE pathway guidance: Senior School or TVET direction and subject focus.
4) Immediate next steps: 3-4 actions.
Keep tone professional, clear, and actionable.`;

      const aiSummary = await aiCareerService.sendMessage(summaryPrompt, conversation, guestContext);

      // Append the AI summary to conversation so the PDF picks it up as the latest assistant content
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: cleanMarkdownFormatting(aiSummary),
        timestamp: new Date()
      };
      setConversation(prev => [...prev, assistantMessage]);

    setShowReport(true);
    } catch (e) {
      setError('Could not generate summary. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const testConnection = async () => {
    setConnectionTest('Testing...');
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CareerPath AI Connection Test'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1:free',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10
        })
      });

      if (response.ok) {
        setConnectionTest('✅ Connection successful!');
      } else {
        const errorText = await response.text();
        setConnectionTest(`❌ Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      setConnectionTest(`❌ Connection failed: ${error}`);
    }
  };

  const downloadReport = async () => {
    const reportName = `CareerPath-AI-Assessment-${guestProfile.name || 'Report'}-${new Date().toISOString().split('T')[0]}`;
    const htmlReport = ReportGenerator.generatePDFReport(guestProfile, conversation);
    await ReportGenerator.downloadPDF(htmlReport, `${reportName}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <div className="text-center mb-4 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">
          Quick Career Assessment{" "}
          <span className="bg-gradient-text bg-clip-text text-transparent">
            with AI
          </span>
        </h2>
        <p className="text-sm sm:text-base text-foreground-muted max-w-2xl mx-auto">
          Get instant career guidance based on your interests and goals. No signup required!
        </p>
      </div>
      
      <Card className="bg-gradient-surface border-card-border shadow-elevated">
        {/* Chat Header */}
        <CardHeader className="border-b border-card-border p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Career Assessment AI</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Quick assessment • No signup required</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1"></div>
                Live
              </Badge>
              <Button size="sm" variant="outline" onClick={testConnection} className="text-xs sm:text-sm px-2 py-1">
                Test AI
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Chat Messages */}
        <CardContent className="p-0">
          <ScrollArea ref={scrollAreaRef} className="h-[60vh] sm:h-[500px] p-3 sm:p-6 overflow-y-auto">
            <div className="space-y-4 sm:space-y-6">
              {conversation.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} space-x-2 sm:space-x-3`}>
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground ml-2 sm:ml-3' 
                        : 'bg-gradient-primary text-primary-foreground mr-2 sm:mr-3'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </div>
                    <div className={`p-3 sm:p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-card-border'
                    }`}>
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-[10px] sm:text-xs opacity-70 mt-1 sm:mt-2">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center">
                      <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <div className="bg-background border border-card-border p-2 sm:p-4 rounded-2xl">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        <span className="text-xs sm:text-sm text-foreground-muted">AI is analyzing...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        
        {/* Finish Assessment CTA - Subtle */}
        {showFinishCTA && !assessmentComplete && !isLoading && !showReport && (
          <div className="p-4 border-t border-card-border bg-gradient-surface/30">
            <div className="text-center space-y-3">
              <p className="text-sm text-foreground-muted">
                You've answered enough questions! Ready to finish your assessment?
              </p>
              <Button 
                onClick={finishAssessment} 
                disabled={isGeneratingReport} 
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {isGeneratingReport ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Download className="w-3 h-3 mr-1" />
                )}
                {isGeneratingReport ? 'Preparing…' : 'Finish Assessment & Get Report'}
              </Button>
            </div>
          </div>
        )}

        {/* Assessment Complete - Force Finish */}
        {assessmentComplete && !isLoading && !showReport && (
          <div className="p-6 border-t border-card-border bg-gradient-surface/50">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">Assessment Complete!</span>
              </div>
              <p className="text-sm text-foreground-muted">
                Great job! I've gathered enough information to create your personalized career report.
              </p>
              <Button onClick={finishAssessment} disabled={isGeneratingReport} className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
                {isGeneratingReport ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                <Download className="w-4 h-4 mr-2" />
                )}
                {isGeneratingReport ? 'Preparing…' : 'Generate My Career Report'}
              </Button>
            </div>
          </div>
        )}

        {/* Report Generated */}
        {showReport && (
          <div className="p-6 border-t border-card-border bg-gradient-surface/50">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Download className="w-5 h-5" />
                <span className="font-medium">Your Report is Ready!</span>
              </div>
              <p className="text-sm text-foreground-muted">
                Download your personalized career assessment report and continue your journey with a full account.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={downloadReport} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Create Full Account
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Chat Input */}
        {!showReport && !assessmentComplete && (
          <div className="p-6 border-t border-card-border">
            {connectionTest && (
              <Alert className="mb-4">
                <AlertDescription>{connectionTest}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex space-x-4">
              <Input
                placeholder="Type your response here..."
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
                Free quick assessment • No signup required
              </p>
              {guestProfile.name && (
                <Badge variant="outline" className="text-xs">
                  Assessing: {guestProfile.name}
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default GuestAIChat;
