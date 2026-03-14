import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquarePlus, Send, X, Bug, Lightbulb, HelpCircle, MessageCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const FeedbackWidget = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [category, setCategory] = useState<'Bug' | 'Feature' | 'Support' | 'General'>('General');
    const [content, setContent] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('feedbacks').insert({
                user_id: user?.id || null,
                user_email: email || user?.email || null,
                category,
                content,
                status: 'new'
            });

            if (error) throw error;

            setSubmitted(true);
            setTimeout(() => {
                setIsOpen(false);
                setSubmitted(false);
                setContent('');
                setEmail('');
                setCategory('General');
            }, 3000);
        } catch (error: any) {
            toast({
                title: "Error sending feedback",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { id: 'General', icon: MessageCircle, label: 'General', color: 'text-sky-400' },
        { id: 'Bug', icon: Bug, label: 'Bug Report', color: 'text-destructive' },
        { id: 'Feature', icon: Lightbulb, label: 'Idea', color: 'text-amber-400' },
        { id: 'Support', icon: HelpCircle, label: 'Support', color: 'text-primary' },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                        className="mb-4 w-80 md:w-96"
                    >
                        <Card className="bg-gradient-surface border-card-border shadow-elevated overflow-hidden backdrop-blur-xl bg-background/95">
                            <CardHeader className="p-4 border-b border-card-border bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <MessageSquarePlus className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm">Share Feedback</CardTitle>
                                            <CardDescription className="text-[10px]">Help us improve CareerGuide</CardDescription>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                {submitted ? (
                                    <div className="py-12 text-center space-y-4">
                                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto scale-110">
                                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-foreground">Thank You!</p>
                                            <p className="text-sm text-foreground-muted">Your feedback has been received.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-4 gap-2">
                                            {categories.map((cat) => {
                                                const Icon = cat.icon;
                                                const isSelected = category === cat.id;
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => setCategory(cat.id as any)}
                                                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                                                            isSelected 
                                                            ? 'border-primary bg-primary/5 shadow-sm' 
                                                            : 'border-card-border hover:bg-muted/50 grayscale'
                                                        }`}
                                                    >
                                                        <Icon className={`w-4 h-4 ${isSelected ? cat.color : 'text-foreground-muted'}`} />
                                                        <span className={`text-[9px] font-black uppercase tracking-tighter ${isSelected ? 'text-foreground' : 'text-foreground-muted'}`}>
                                                            {cat.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {!user && (
                                            <Input
                                                placeholder="Your email (optional)"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="bg-muted/20 border-card-border h-9 text-sm"
                                            />
                                        )}

                                        <Textarea
                                            placeholder="What's on your mind? Tell us anything..."
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            className="min-h-[120px] bg-muted/20 border-card-border resize-none text-sm"
                                            required
                                        />

                                        <Button 
                                            type="submit" 
                                            disabled={loading || !content.trim()} 
                                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-10 shadow-glow"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" /> Send Feedback
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-glow transition-all duration-300 ${
                    isOpen 
                    ? 'bg-destructive text-white' 
                    : 'bg-primary text-white'
                }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquarePlus className="w-6 h-6" />}
            </motion.button>
        </div>
    );
};

export default FeedbackWidget;
