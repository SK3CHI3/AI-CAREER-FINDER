import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, User, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const StudentCounselorChat = () => {
  const { user, profile } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadSession();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSession = async () => {
    setIsLoading(true);
    // Realtime subscription setup omitted for brevity in MVP.
    const { data: sessionData } = await supabase
      .from('counselor_sessions')
      .select('*')
      .eq('student_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (sessionData) {
      setSession(sessionData);
      const { data: messagesData } = await supabase
        .from('counselor_messages')
        .select('*')
        .eq('session_id', sessionData.id)
        .order('created_at', { ascending: true });
      
      setMessages(messagesData || []);
    }
    setIsLoading(false);
  };

  const requestSession = async () => {
    setIsRequesting(true);
    const { data: newSession, error } = await supabase
      .from('counselor_sessions')
      .insert([{ student_id: user?.id, status: 'requested' }])
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to request a session.', variant: 'destructive' });
    } else {
      setSession(newSession);
      toast({ title: 'Session Requested', description: 'A counselor will join you shortly.' });
    }
    setIsRequesting(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session) return;

    const msg = { session_id: session.id, sender_id: user?.id, content: newMessage };
    setMessages(prev => [...prev, { ...msg, id: Date.now().toString(), created_at: new Date().toISOString() }]);
    setNewMessage('');

    const { error } = await supabase.from('counselor_messages').insert([msg]);
    if (error) {
      toast({ title: 'Message failed', description: 'Could not send message.', variant: 'destructive' });
    } else {
      // Reload strictly not necessary if we had realtime, but we'll do a silent reload here for sync
      const { data } = await supabase.from('counselor_messages').select('*').eq('session_id', session.id).order('created_at', { ascending: true });
      if(data) setMessages(data);
    }
  };

  // Payment check
  if (profile?.payment_status !== 'completed') {
    return (
      <Card className="bg-card border-card-border overflow-hidden">
        <CardContent className="p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Live Counselor Access Required</h2>
          <p className="text-foreground-muted">You need to unlock platform access to book a 1-on-1 session with our professional career counselors.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!session) {
    return (
      <Card className="bg-card border-card-border">
        <CardContent className="p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Talk to a Human Professional</h2>
          <p className="text-foreground-muted max-w-md mx-auto">Connect directly with a career expert for a personalized guidance session regarding your CBE pathway and university choices.</p>
          <Button onClick={requestSession} disabled={isRequesting} className="bg-primary text-white">
            {isRequesting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
            Request Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-card-border h-[600px] flex flex-col">
      <CardHeader className="border-b border-card-border bg-muted/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-full">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Live Counselor Hub</CardTitle>
              <p className="text-sm text-foreground-muted capitalize">Status: {session.status}</p>
            </div>
          </div>
          {session.status === 'requested' && (
            <div className="text-xs flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-full font-medium">
              <Loader2 className="w-3 h-3 animate-spin" /> Waiting for counselor...
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center my-4">
          <span className="text-xs bg-muted text-foreground-muted px-2 py-1 rounded-full">
            Session started {new Date(session.created_at).toLocaleDateString()}
          </span>
        </div>
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl p-3 ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <div className={`text-[10px] mt-1 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="p-4 border-t border-card-border bg-background">
        <form onSubmit={sendMessage} className="flex gap-2 w-full relative">
          <Input 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Type your message here..." 
            className="flex-1 bg-muted/50 border-white/5 rounded-full px-4 pr-12 focus-visible:ring-primary/40 focus-visible:ring-offset-0 focus-visible:border-primary/40"
            disabled={session.status === 'completed'}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || session.status === 'completed'} className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-white shadow-glow">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};
