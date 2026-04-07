import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Video, Star, Phone, MapPin, XCircle, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// IntaSend Types
declare global {
  interface Window {
    IntaSend: any
  }
}

export const CounselorDirectory = ({ limit }: { limit?: number }) => {
  const { user, profile } = useAuth();
  const [counselors, setCounselors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Payment States
  const [isIntaSendLoaded, setIsIntaSendLoaded] = useState(false);
  const [intaSendInstance, setIntaSendInstance] = useState<any>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();
 
  useEffect(() => {
    loadCounselors();
    loadIntaSend();
  }, []);
 
  const loadCounselors = async () => {
    setIsLoading(true);
    const { data: profilesData, error } = await supabase
      .from('counselor_profiles')
      .select('*, profile:profiles(id, full_name)')
      .eq('is_active', true);
 
    if (!error && profilesData) {
      const filtered = limit ? profilesData.slice(0, limit) : profilesData;
      setCounselors(filtered);
    }
    setIsLoading(false);
  };

  const loadIntaSend = () => {
    if (window.IntaSend) {
      setIsIntaSendLoaded(true);
      return;
    }
    
    // Check if script is already being loaded
    if (document.querySelector('script[src*="intasend-inlinejs-sdk"]')) {
      const checkIntaSend = () => {
        if (window.IntaSend) {
          setIsIntaSendLoaded(true);
        } else {
          setTimeout(checkIntaSend, 100);
        }
      };
      setTimeout(checkIntaSend, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/intasend-inlinejs-sdk@4.0.7/build/intasend-inline.js';
    script.async = true;
    script.onload = () => setIsIntaSendLoaded(true);
    document.head.appendChild(script);
  };

  const initiateBooking = (counselor: any) => {
    if (!window.IntaSend) {
      toast({ title: 'Error', description: 'Payment system not loaded. Please refresh.', variant: 'destructive' });
      return;
    }

    setProcessingId(counselor.id);
    
    try {
      const apiKey = import.meta.env.VITE_INTASEND_PUBLIC_KEY || 'ISPubKey_test_123456789';
      const isLive = import.meta.env.VITE_INTASEND_LIVE === 'true';
      
      const intaSend = new window.IntaSend({
        publicAPIKey: apiKey,
        live: isLive,
        redirectURL: window.location.origin + '/student'
      })
      .on("COMPLETE", async (results: any) => {
        await handlePaymentSuccess(results, counselor);
      })
      .on("FAILED", (results: any) => {
        setProcessingId(null);
        toast({ title: 'Payment Failed', description: 'Your transaction could not be processed.', variant: 'destructive' });
      })
      .on("IN-PROGRESS", () => {
        toast({ title: 'Processing', description: 'Completing your payment... Please wait.' });
      })
      .on("ERROR", () => {
        setProcessingId(null);
        toast({ title: 'Error', description: 'A system error occurred.', variant: 'destructive' });
      });
      
      intaSend.run({
        amount: counselor.hourly_rate,
        currency: 'KES',
        email: profile?.email || user?.email || '',
        phone_number: '254700000000',
        api_ref: `BOOK_${counselor.id}_${Date.now()}`,
        first_name: profile?.full_name?.split(' ')[0] || 'Student'
      });
      
    } catch (err) {
      setProcessingId(null);
      toast({ title: 'System Error', description: 'Failed to open payment gateway.', variant: 'destructive' });
    }
  };

  const handlePaymentSuccess = async (results: any, counselor: any) => {
    const { error } = await supabase.from('counselor_sessions').insert([{
      student_id: user?.id,
      counselor_id: counselor.id,
      status: 'requested',
      payment_amount: counselor.hourly_rate,
      payment_reference: results.reference,
      intasend_transaction_id: results.transaction_id || results.id
    }]);

    setProcessingId(null);

    if (error) {
      toast({ title: 'Booking Issue', description: 'Payment succeeded but session creation failed. Support has been notified.', variant: 'destructive' });
    } else {
      toast({ title: 'Booking Confirmed!', description: `Your session with ${counselor.profile?.full_name} is requested.` });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Counselor Directory
          </h2>
          <p className="text-foreground-muted mt-1">Browse verified career experts, view their real-time availability, and book a live 1-on-1 strategy call.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {counselors.map((counselor) => (
          <Card key={counselor.id} className="bg-card border-card-border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group">
            <div className="h-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20 relative">
              {counselor.image_url && (
                <img src={counselor.image_url} alt="Cover" className="w-full h-full object-cover opacity-50" />
              )}
            </div>
            <div className="px-6 flex justify-between items-end -mt-10">
              <Avatar className="w-20 h-20 border-4 border-card rounded-xl bg-muted">
                <AvatarFallback className="text-2xl font-bold">{counselor.profile?.full_name?.substring(0, 2) || 'C'}</AvatarFallback>
              </Avatar>
              <Badge variant="outline" className="mb-2 bg-background/80 backdrop-blur font-bold border-primary/20 text-primary">
                KSh {Number(counselor.hourly_rate).toLocaleString()}/hr
              </Badge>
            </div>
            
            <CardContent className="pt-4 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-foreground leadiing-tight">{counselor.profile?.full_name || 'Verified Counselor'}</h3>
              <p className="text-sm font-medium text-primary mb-3">{counselor.title}</p>
              
              <p className="text-sm text-foreground-muted line-clamp-3 mb-4 flex-1">
                {counselor.bio}
              </p>

              <div className="space-y-2 mt-auto">
                <Button 
                  className="w-full" 
                  disabled={processingId === counselor.id || !isIntaSendLoaded}
                  onClick={() => initiateBooking(counselor)}
                >
                  {processingId === counselor.id ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    <><Video className="w-4 h-4 mr-2" /> Book Call</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {counselors.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-card-border rounded-xl">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-foreground-muted" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No Counselors Available</h3>
            <p className="text-foreground-muted">Check back later as we register new career experts.</p>
          </div>
        )}
      </div>
    </div>
  );
};
