import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Bot, User, Sparkles, Loader2, AlertCircle, Download, ArrowRight, RefreshCw } from "lucide-react";
import { aiCareerService, type ChatMessage } from "@/lib/ai-service";
import { ReportGenerator, type GuestProfile } from "@/lib/report-generator";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BackgroundGradient from "@/components/BackgroundGradient";

const QuickAssessment = () => {
    const [message, setMessage] = useState("");
    const [conversation, setConversation] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [guestProfile, setGuestProfile] = useState<GuestProfile>({});
    const [showFinishCTA, setShowFinishCTA] = useState(false);
    const [assessmentComplete, setAssessmentComplete] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
                scrollElement.scrollTo({
                    top: scrollElement.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    };

    useEffect(() => {
        setTimeout(scrollToBottom, 100);
    }, [conversation]);

    const cleanMarkdownFormatting = (text: string): string => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/#{1,6}\s/g, '')
            .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
            .trim();
    };

    // Auto-start for standalone page
    useEffect(() => {
        const welcomeMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Karibu to CareerGuide AI! 🎉\n\nI'm your friendly career counselor. Let's find your perfect career path through Kenya's CBE system!\n\nWhat's your name? 😊`,
            timestamp: new Date()
        };
        setConversation([welcomeMessage]);
    }, []);

    const extractProfileInfo = (userMessage: string, aiResponse: string) => {
        const message = userMessage.toLowerCase();
        const newProfile = { ...guestProfile };
        
        // Simplified extraction for the demo
        if (!newProfile.name) {
            const nameMatch = message.match(/(?:my name is|i'm|i am|call me)\s+([a-zA-Z\s]+)/i);
            if (nameMatch) newProfile.name = nameMatch[1].trim();
        }
        setGuestProfile(newProfile);
    };

    const handleSend = async () => {
        if (!message.trim() || isLoading) return;

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: message.trim(),
            timestamp: new Date()
        };

        setConversation(prev => [...prev, userMsg]);
        setMessage("");
        setIsLoading(true);

        try {
            const response = await aiCareerService.sendMessage(userMsg.content, conversation, {
                name: guestProfile.name,
                schoolLevel: 'secondary',
            });

            const assistantMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: cleanMarkdownFormatting(response),
                timestamp: new Date()
            };

            setConversation(prev => [...prev, assistantMsg]);
            extractProfileInfo(userMsg.content, response);

            const userTurns = conversation.filter(m => m.role === 'user').length + 1;
            if (userTurns >= 6) setShowFinishCTA(true);
            if (userTurns >= 8) setAssessmentComplete(true);

        } catch (err) {
            setError('Failed to connect to AI. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const finishAssessment = async () => {
        setIsGeneratingReport(true);
        try {
            const summary = await aiCareerService.sendMessage("Summarize our session for a career report.", conversation, {});
            const assistantMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: cleanMarkdownFormatting(summary),
                timestamp: new Date()
            };
            setConversation(prev => [...prev, assistantMsg]);
            setShowReport(true);
        } catch (e) {
            setError('Error generating report.');
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const downloadReport = async () => {
        const html = ReportGenerator.generatePDFReport(guestProfile, conversation);
        await ReportGenerator.downloadPDF(html, `CareerGuide-Report.pdf`);
    };

    return (
        <div className="min-h-screen text-foreground relative overflow-x-hidden pt-20">
            <BackgroundGradient />
            <Navigation />
            
            <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
                {/* Removed Hero title section for a cleaner assessment focus */}

                <Card className="bg-gradient-surface border-card-border shadow-elevated overflow-hidden">
                    <CardHeader className="border-b border-card-border bg-muted/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className="bg-primary/10 text-primary text-[11px] font-bold px-2 py-0.5 rounded-full border border-primary/20 animate-pulse flex items-center shrink-0">
                                    <Sparkles className="w-3 h-3 mr-1" /> AI Active
                                </span>
                                <span className="text-sm font-medium">CareerGuide AI Counselor</span>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                        <ScrollArea ref={scrollAreaRef} className="h-[500px] p-6">
                            <div className="space-y-6">
                                {conversation.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-3 group`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-glow transition-transform group-hover:scale-110 ${
                                                msg.role === 'user' 
                                                ? 'bg-gradient-to-br from-primary to-primary-hover text-white' 
                                                : 'bg-gradient-to-br from-secondary to-secondary-hover text-white'
                                            }`}>
                                                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                            </div>
                                            <div className={`p-4 rounded-[1.25rem] shadow-sm leading-relaxed ${
                                                msg.role === 'user' 
                                                ? 'bg-primary text-white rounded-br-none' 
                                                : 'bg-background border border-card-border rounded-bl-none'
                                            }`}>
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary-hover text-white flex items-center justify-center animate-pulse shadow-glow">
                                            <Bot className="w-5 h-5" />
                                        </div>
                                        <div className="bg-muted/40 p-4 rounded-[1.25rem] rounded-bl-none flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="p-6 border-t border-card-border bg-muted/20">
                            {showReport ? (
                                <div className="text-center space-y-4 py-4">
                                    <div className="flex items-center justify-center gap-2 text-green-500 font-bold text-lg">
                                        <Sparkles className="w-6 h-6" /> Assessment Complete
                                    </div>
                                    <Button onClick={downloadReport} size="lg" className="bg-gradient-primary shadow-glow ring-offset-background transition-all hover:scale-105">
                                        <Download className="w-5 h-5 mr-2" /> Download PDF Report
                                    </Button>
                                    <p className="text-xs text-foreground-muted">Your report includes top 3 career matches and CBE subjects focus.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {(showFinishCTA || assessmentComplete) && (
                                        <Alert className="bg-primary/5 border-primary/20">
                                            <AlertDescription className="text-center">
                                                <Button onClick={finishAssessment} variant="link" className="text-primary font-bold">
                                                    Click here to finish and generate your report
                                                </Button>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    <div className="flex gap-4">
                                        <Input
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="Type your message..."
                                            className="bg-background border-card-border focus:ring-primary"
                                            disabled={isLoading}
                                        />
                                        <Button onClick={handleSend} disabled={isLoading || !message.trim()} className="bg-primary hover:bg-primary-hover shadow-sm">
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
};

export default QuickAssessment;
