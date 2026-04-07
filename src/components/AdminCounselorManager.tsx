import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, Clock, Video, SwitchCamera, MessageSquare, DollarSign, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export const AdminCounselorManager = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Bookings State
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  
  // Counselors State
  const [counselors, setCounselors] = useState<any[]>([]);
  const [isLoadingCounselors, setIsLoadingCounselors] = useState(true);

  // Management State
  const [isCounsellorModalOpen, setIsCounsellorModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCounsellor, setNewCounsellor] = useState({
    user_id: '',
    title: '',
    bio: '',
    hourly_rate: 1500,
    specialties: [] as string[]
  });

  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
    loadCounselors();
  }, []);

  const loadBookings = async () => {
    setIsLoadingBookings(true);
    const { data } = await supabase
      .from('counselor_sessions')
      .select(`
        *, 
        student:profiles!counselor_sessions_student_id_fkey(full_name, email),
        counselor:counselor_profiles!counselor_sessions_counselor_id_fkey(title, profile:profiles(full_name))
      `)
      .order('created_at', { ascending: false });

    if (data) setBookings(data);
    setIsLoadingBookings(false);
  };

  const loadCounselors = async () => {
    setIsLoadingCounselors(true);
    const { data } = await supabase
      .from('counselor_profiles')
      .select('*, profile:profiles(full_name, email)')
      .order('created_at', { ascending: false });

    if (data) setCounselors(data);
    setIsLoadingCounselors(false);
  };

  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('counselor_sessions')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update booking status.', variant: 'destructive' });
    } else {
      toast({ title: 'Status Updated', description: `Booking is now ${status}.` });
      loadBookings();
    }
  };

  const toggleCounselorStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('counselor_profiles')
      .update({ is_active: !currentStatus })
      .eq('id', id);
      
    if (error) {
      toast({ title: 'Error', description: 'Failed to update counselor status.', variant: 'destructive' });
    } else {
      toast({ title: 'Status Updated', description: 'Counselor visibility changed.' });
      loadCounselors();
    }
  };

  const handleAddCounselor = async () => {
    if (!newCounsellor.user_id || !newCounsellor.title) {
      toast({ title: 'Validation Error', description: 'User ID and Job Title are required.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase
      .from('counselor_profiles')
      .insert([{
        ...newCounsellor,
        is_active: true,
        created_at: new Date().toISOString()
      }]);

    setIsSubmitting(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'New counselor registered.' });
      setIsCounsellorModalOpen(false);
      loadCounselors();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Counselor Management</h2>
        <p className="text-muted-foreground">Manage incoming call bookings and the counselor directory.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="bookings">Call Bookings</TabsTrigger>
          <TabsTrigger value="directory">Directory Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          <Card className="bg-card border-card-border">
            <CardHeader>
              <CardTitle>Incoming Call Requests</CardTitle>
              <CardDescription>Review and manage requested sessions.</CardDescription>
            </CardHeader>
            <CardContent>
 senior review
              {isLoadingBookings ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : bookings.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed border-border rounded-xl">
                  <Video className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No calls booked yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex flex-col md:flex-row justify-between p-4 border border-card-border rounded-xl bg-muted/20">
                      <div className="space-y-2 mb-4 md:mb-0">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg">{booking.student?.full_name || 'Unknown'}</span>
                          <Badge variant="outline" className={`font-bold ${
                            booking.status === 'requested' ? 'text-yellow-500 border-yellow-500/30' :
                            booking.status === 'active' ? 'text-blue-500 border-blue-500/30' :
                            'text-green-500 border-green-500/30'
                          }`}>
                            {booking.status}
                          </Badge>
                          {booking.payment_amount && (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-none">
                              Paid KSh {booking.payment_amount}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground flex flex-col gap-1">
                          <span>📧 {booking.student?.email}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Booked: {new Date(booking.created_at).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 text-primary pt-1">
                            <UserCog className="w-3 h-3" /> Requested Counselor: {booking.counselor?.profile?.full_name || 'Admin'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 justify-center shrink-0">
                        {booking.status === 'requested' && (
                          <Button size="sm" onClick={() => updateBookingStatus(booking.id, 'active')} className="bg-primary hover:bg-primary/90 text-white">
                            Accept & Connect
                          </Button>
                        )}
                        {booking.status === 'active' && (
                          <Button size="sm" variant="outline" onClick={() => updateBookingStatus(booking.id, 'completed')} className="text-green-600 border-green-500/30 hover:bg-green-500/10">
                            Mark Completed
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="directory" className="space-y-6">
          <Card className="bg-card border-card-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Counselor Profiles</CardTitle>
                <CardDescription>Manage the experts shown in the student directory.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsCounsellorModalOpen(true)}>
                <UserCog className="w-4 h-4 mr-2" /> Add Counselor
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoadingCounselors ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : counselors.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground">No counselors mapped yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {counselors.map((c) => (
                    <div key={c.id} className="flex gap-4 p-4 border border-border rounded-xl bg-card">
                      <Avatar className="w-16 h-16 rounded-md">
                        <AvatarImage src={c.image_url} />
                        <AvatarFallback className="bg-muted text-muted-foreground">{c.profile?.full_name?.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-foreground">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold">{c.profile?.full_name}</h4>
                            <p className="text-xs text-primary font-medium">{c.title}</p>
                          </div>
                          <Badge variant="outline" className="border-border bg-muted/30">KSh {c.hourly_rate}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{c.bio}</p>
                        <div className="flex items-center gap-2 mt-4">
                          <Switch 
                            checked={c.is_active} 
                            onCheckedChange={() => toggleCounselorStatus(c.id, c.is_active)}
                            id={`status-${c.id}`}
                          />
                          <Label htmlFor={`status-${c.id}`} className="text-xs font-semibold uppercase text-muted-foreground cursor-pointer">
                            {c.is_active ? 'Visible in Directory' : 'Hidden'}
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Counselor Modal */}
      <Dialog open={isCounsellorModalOpen} onOpenChange={setIsCounsellorModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Register New Counselor</DialogTitle>
            <DialogDescription>Add a verified career expert to the directory.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-foreground">
            <div className="space-y-2">
              <Label className="text-foreground/80">User ID (Supabase Auth ID)</Label>
              <Input 
                placeholder="Paste the user's UUID here" 
                value={newCounsellor.user_id}
                onChange={e => setNewCounsellor({...newCounsellor, user_id: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Professional Title</Label>
              <Input 
                placeholder="e.g. Senior Career Strategist" 
                value={newCounsellor.title}
                onChange={e => setNewCounsellor({...newCounsellor, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Bio / Expertise</Label>
              <Textarea 
                placeholder="Professional background and specialized areas..." 
                value={newCounsellor.bio}
                onChange={e => setNewCounsellor({...newCounsellor, bio: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Hourly Rate (KES)</Label>
              <Input 
                type="number" 
                value={newCounsellor.hourly_rate}
                onChange={e => setNewCounsellor({...newCounsellor, hourly_rate: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCounsellorModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCounselor} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Counselor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>Review complete booking and payment information.</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Student</p>
                  <p className="font-bold">{selectedBooking.student?.full_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Counselor</p>
                  <p className="font-bold">{selectedBooking.counselor?.profile?.full_name || 'Unassigned'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Payment Ref</p>
                  <p className="font-mono text-xs">{selectedBooking.payment_reference || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Transaction ID</p>
                  <p className="font-mono text-xs">{selectedBooking.intasend_transaction_id || 'N/A'}</p>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg border border-border">
                <p className="text-xs font-bold text-primary mb-1 uppercase tracking-tighter">Admin Note</p>
                <p className="text-xs text-muted-foreground">This session was booked on {new Date(selectedBooking.created_at).toLocaleDateString()}. Initial payment of KSh {selectedBooking.payment_amount} confirmed.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
