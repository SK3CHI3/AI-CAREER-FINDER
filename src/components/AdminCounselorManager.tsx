import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, Clock, Video, SwitchCamera, MessageSquare, DollarSign, UserCog, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
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
    full_name: '',
    title: '',
    bio: '',
    hourly_rate: 1500,
    image_url: '',
    specialties: [] as string[]
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingMode, setEditingMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
    loadCounselors();
  }, []);

  const loadBookings = async () => {
    setIsLoadingBookings(true);
    const { data } = await (supabase
      .from('counselor_sessions') as any)
      .select(`
        *, 
        student:profiles!counselor_sessions_student_id_fkey(full_name, email),
        counselor:counselor_profiles!counselor_sessions_counselor_id_fkey(
          full_name, 
          title,
          profiles(full_name)
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      const processed = (data as any[]).map(b => ({
        ...b,
        counselor: b.counselor ? {
          ...b.counselor,
          full_name: b.counselor.full_name || b.counselor.profiles?.full_name || 'Admin'
        } : null
      }));
      setBookings(processed);
    }
    setIsLoadingBookings(false);
  };

  const loadCounselors = async () => {
    setIsLoadingCounselors(true);
    const { data } = await (supabase
      .from('counselor_profiles') as any)
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });

    if (data) {
      const processed = (data as any[]).map(c => ({
        ...c,
        full_name: c.full_name || c.profiles?.full_name || 'Verified Counselor'
      }));
      setCounselors(processed);
    }
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
    const { error } = await (supabase
      .from('counselor_profiles') as any)
      .update({ is_active: !currentStatus })
      .eq('id', id);
      
    if (error) {
      toast({ title: 'Error', description: 'Failed to update counselor status.', variant: 'destructive' });
    } else {
      toast({ title: 'Status Updated', description: 'Counselor visibility changed.' });
      loadCounselors();
    }
  };

  const handleDeleteCounselor = async (id: string, image_url?: string) => {
    if (!confirm('Are you sure you want to delete this counselor? This cannot be undone.')) return;

    setIsLoadingCounselors(true);
    
    // 1. Delete image from storage if exists
    if (image_url && image_url.includes('counselor-images')) {
      try {
        const path = image_url.split('counselor-images/').pop();
        if (path) {
          await supabase.storage.from('counselor-images').remove([path]);
        }
      } catch (e) {
        console.error('Error deleting image:', e);
      }
    }

    // 2. Delete database record
    const { error } = await supabase.from('counselor_profiles').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete counselor.', variant: 'destructive' });
    } else {
      toast({ title: 'Counselor Deleted', description: 'Record removed successfully.' });
      loadCounselors();
    }
    setIsLoadingCounselors(false);
  };

  const handleSaveCounselor = async () => {
    if (!newCounsellor.full_name) {
      toast({ title: 'Validation Error', description: 'Counselor Name is required.', variant: 'destructive' });
      return;
    }
    if (!newCounsellor.title) {
      toast({ title: 'Validation Error', description: 'Job Title is required.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    let imageUrl = newCounsellor.image_url || '';

    // Handle Image Upload
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profiles/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('counselor-images')
        .upload(filePath, imageFile);
        
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('counselor-images')
          .getPublicUrl(filePath);
        imageUrl = publicUrl;
      } else {
        toast({ title: 'Upload Failed', description: uploadError.message, variant: 'destructive' });
      }
    }

    let error;

    if (editingMode && editingId) {
      const res = await (supabase
        .from('counselor_profiles') as any)
        .update({
          title: newCounsellor.title,
          full_name: newCounsellor.full_name,
          bio: newCounsellor.bio,
          hourly_rate: newCounsellor.hourly_rate,
          image_url: imageUrl
        })
        .eq('id', editingId);
      error = res.error;
    } else {
      const res = await (supabase
        .from('counselor_profiles') as any)
        .insert([{
          full_name: newCounsellor.full_name,
          title: newCounsellor.title,
          bio: newCounsellor.bio,
          hourly_rate: newCounsellor.hourly_rate,
          image_url: imageUrl,
          is_active: true,
          created_at: new Date().toISOString()
        }]);
      error = res.error;
    }

    setIsSubmitting(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: editingMode ? 'Counselor updated.' : 'New counselor registered.' });
      setIsCounsellorModalOpen(false);
      setImageFile(null);
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
                            <UserCog className="w-3 h-3" /> Requested Counselor: {booking.counselor?.full_name || 'Admin'}
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
              <Button size="sm" onClick={() => {
                setEditingMode(false);
                setEditingId(null);
                setNewCounsellor({ full_name: '', title: '', bio: '', hourly_rate: 1500, image_url: '', specialties: [] });
                setImageFile(null);
                setIsCounsellorModalOpen(true);
              }}>
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
                        <AvatarFallback className="bg-muted text-muted-foreground">{c.full_name?.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-foreground">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold">{c.full_name}</h4>
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-auto text-primary"
                            onClick={() => {
                              setEditingMode(true);
                              setEditingId(c.id);
                              setNewCounsellor({
                                full_name: c.full_name || '',
                                title: c.title || '',
                                bio: c.bio || '',
                                hourly_rate: c.hourly_rate || 1500,
                                image_url: c.image_url || '',
                                specialties: []
                              });
                              setImageFile(null);
                              setIsCounsellorModalOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDeleteCounselor(c.id, c.image_url)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
            <DialogTitle>{editingMode ? 'Edit Counselor' : 'Register New Counselor'}</DialogTitle>
            <DialogDescription>{editingMode ? 'Modify career expert details.' : 'Add a verified career expert to the directory.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-foreground">
            <div className="space-y-2">
              <Label className="text-foreground/80">Counselor Full Name</Label>
              <Input 
                placeholder="e.g. Dr. Jane Doe" 
                value={newCounsellor.full_name}
                onChange={e => setNewCounsellor({...newCounsellor, full_name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 rounded-lg border-2 border-border">
                  <AvatarImage src={imageFile ? URL.createObjectURL(imageFile) : newCounsellor.image_url} />
                  <AvatarFallback className="bg-muted"><ImageIcon className="w-6 h-6 text-muted-foreground" /></AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                    }}
                    className="text-xs h-9 cursor-pointer"
                  />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest pl-1">PNG, JPG or WebP (Max 2MB)</p>
                </div>
              </div>
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
            <Button onClick={handleSaveCounselor} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingMode ? 'Save Changes' : 'Register Counselor')}
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
                  <p className="font-bold">{selectedBooking.counselor?.full_name || 'Unassigned'}</p>
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
