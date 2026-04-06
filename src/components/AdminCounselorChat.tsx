import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, User, Loader2, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminCounselorChat = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (activeSession) {
      loadMessages(activeSession.id);
    }
  }, [activeSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    setIsLoading(true);
    const { data: sessionsData } = await supabase
      .from('counselor_sessions')
      .select('*, student:profiles!counselor_sessions_student_id_fkey(full_name, avatar_url)')
      .order('created_at', { ascending: false });

    if (sessionsData) {
      setSessions(sessionsData);
    }
    setIsLoading(false);
  };

  const loadMessages = async (sessionId: string) => {
    const { data } = await supabase
      .from('counselor_messages')
      .select('*, sender:profiles!counselor_messages_sender_id_fkey(full_name, role)')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    setMessages(data || []);
  };

  const claimSession = async (session: any) => {
    const { error } = await supabase
      .from('counselor_sessions')
      .update({ counselor_id: user?.id, status: 'active' })
      .eq('id', session.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to claim session.', variant: 'destructive' });
      return;
    }
    
    toast({ title: 'Session Claimed', description: 'You are now the counselor for this session.' });
    loadSessions();
    setActiveSession({ ...session, status: 'active', counselor_id: user?.id });
  };

  const markCompleted = async (session: any) => {
    const { error } = await supabase
      .from('counselor_sessions')
      .update({ status: 'completed' })
      .eq('id', session.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to complete session.', variant: 'destructive' });
      return;
    }
    
    toast({ title: 'Session Completed', description: 'The chat has been closed.' });
    loadSessions();
    if (activeSession?.id === session.id) {
      setActiveSession({ ...session, status: 'completed' });
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeSession) return;

    const msg = { session_id: activeSession.id, sender_id: user?.id, content: newMessage };
    // Optimistic UI update
    setMessages(prev => [...prev, { ...msg, id: Date.now().toString(), created_at: new Date().toISOString(), sender: { full_name: 'You', role: 'admin' } }]);
    setNewMessage('');

    const { error } = await supabase.from('counselor_messages').insert([msg]);
    if (error) {
      toast({ title: 'Message failed', description: 'Could not send message.', variant: 'destructive' });
    } else {
      loadMessages(activeSession.id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[800px]">
      {/* Sessions List Sidebar */}
      <Card className="col-span-1 border-card-border overflow-hidden flex flex-col">
        <CardHeader className="bg-muted/20 border-b border-card-border py-4">
          <CardTitle className="text-lg">Chat Sessions</CardTitle>
          <CardDescription>Manage incoming student requests</CardDescription>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {sessions.length === 0 ? (
              <p className="text-sm text-foreground-muted text-center p-4">No sessions found.</p>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActiveSession(s)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${activeSession?.id === s.id ? 'bg-primary/10 border-primary/30' : 'bg-card hover:bg-muted border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm truncate pr-2">{s.student?.full_name || 'Unknown Student'}</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                      s.status === 'requested' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      s.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      'bg-slate-500/10 text-slate-500 border-slate-500/20'
                    }`}>
                      {s.status}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-foreground-muted">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Active Chat Window */}
      <Card className="col-span-1 md:col-span-3 border-card-border flex flex-col h-full bg-card">
        {activeSession ? (
          <>
            <CardHeader className="border-b border-card-border bg-muted/20 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{activeSession.student?.full_name || 'Student'}</CardTitle>
                    <p className="text-xs text-foreground-muted capitalize flex items-center gap-2">
                      <Badge variant="secondary" className="h-4 text-[10px] uppercase font-bold">{activeSession.status}</Badge>
                      Started {new Date(activeSession.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {activeSession.status === 'requested' && (
                    <Button size="sm" onClick={() => claimSession(activeSession)} className="bg-primary hover:bg-primary/90 text-white">
                      Start Session
                    </Button>
                  )}
                  {activeSession.status === 'active' && (
                    <Button size="sm" variant="outline" onClick={() => markCompleted(activeSession)} className="border-destructive/30 text-destructive hover:bg-destructive/10">
                      <CheckCircle className="w-4 h-4 mr-1" /> Complete
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center p-12 text-foreground-muted flex flex-col items-center">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                  <p>No messages yet. Say hello to get started.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} mb-4 w-full`}>
                      <span className="text-[10px] text-foreground-muted mb-1 px-1 font-medium">
                        {isAdmin ? 'You' : msg.sender?.full_name || 'Student'}
                      </span>
                      <div className={`max-w-[75%] rounded-2xl p-3 ${isAdmin ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        <div className={`text-[10px] mt-1 opacity-70 ${isAdmin ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </CardContent>
            <CardFooter className="p-4 border-t border-card-border bg-background">
              <form onSubmit={sendMessage} className="flex gap-3 w-full">
                <Input 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  placeholder="Type a message to the student..." 
                  className="flex-1 bg-muted border-white/10 focus-visible:ring-primary/50"
                  disabled={activeSession.status !== 'active'}
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || activeSession.status !== 'active'} 
                  className="bg-primary hover:bg-primary/90 text-white min-w-[100px]"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </form>
            </CardFooter>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-foreground-muted">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Session Selected</h3>
            <p className="max-w-md">Select a chat session from the history to view details, claim incoming requests, or reply to students.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
