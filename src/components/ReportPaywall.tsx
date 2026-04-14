import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CreditCard, ShieldCheck, Zap, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Declare IntaSend types
declare global {
  interface Window {
    IntaSend: any;
    intaSendInitialized?: boolean;
  }
}

interface ReportPaywallProps {
  onPaymentSuccess: () => void;
  studentName?: string;
  email?: string;
}

const ReportPaywall: React.FC<ReportPaywallProps> = ({ onPaymentSuccess, studentName, email }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [intaSendInstance, setIntaSendInstance] = useState<any>(null);

  const PAYMENT_AMOUNT = 50; // KSh 50

  useEffect(() => {
    // Check if script is already loaded
    if (window.IntaSend) {
      setIsSdkLoaded(true);
      initializeIntaSend();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/intasend-inlinejs-sdk@4.0.7/build/intasend-inline.js';
    script.async = true;
    script.onload = () => {
      setIsSdkLoaded(true);
      initializeIntaSend();
    };
    script.onerror = () => {
      setError('Failed to load payment system. Please refresh the page.');
    };
    document.head.appendChild(script);

    return () => {
        // Cleanup if needed
    };
  }, []);

  const initializeIntaSend = () => {
    if (!window.IntaSend || window.intaSendInitialized) return;

    try {
      const apiKey = import.meta.env.VITE_INTASEND_PUBLIC_KEY || 'ISPubKey_test_123456789';
      const isLive = import.meta.env.VITE_INTASEND_LIVE === 'true';

      const intaSend = new window.IntaSend({
        publicAPIKey: apiKey,
        live: isLive,
      })
      .on("COMPLETE", (results: any) => {
        onPaymentSuccess();
      })
      .on("FAILED", (results: any) => {
        setError(results.message || 'Payment failed. Please try again.');
        setIsLoading(false);
      })
      .on("ERROR", (error: any) => {
        setError('Payment system error. Please try again.');
        setIsLoading(false);
      });

      setIntaSendInstance(intaSend);
      window.intaSendInitialized = true;
    } catch (err) {
      setError('Failed to initialize payment system.');
    }
  };

  const handlePayment = () => {
    if (!intaSendInstance) {
      setError('Payment system is not ready. Please refresh.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      intaSendInstance.run({
        amount: PAYMENT_AMOUNT,
        currency: 'KES',
        email: email || '',
        api_ref: `REPORT_${Date.now()}`,
        first_name: studentName?.split(' ')[0] || 'Student',
        last_name: studentName?.split(' ').slice(1).join(' ') || 'Report',
      });
    } catch (err) {
      setError('Failed to open payment window.');
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-blue-600/5 border-primary/30 shadow-2xl overflow-hidden rounded-[2rem]">
      <CardContent className="p-5 md:p-10">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center transform rotate-3 shadow-lg">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Unlock Full Diagnostic</h3>
            <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
              Get your complete MBTI profile, RIASEC scores, and personalized 12-month career roadmap.
            </p>
          </div>

          <div className="relative py-4 px-8 bg-background/50 rounded-2xl border border-primary/10 shadow-inner">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary/60">KSh</span>
              <span className="text-6xl font-black text-primary tracking-tighter">50</span>
            </div>
            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">ONE-TIME FEE</div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-background/40 border border-primary/5 text-[12px] font-bold text-foreground/80">
              <Zap className="w-4 h-4 text-amber-500" /> Instant
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-background/40 border border-primary/5 text-[12px] font-bold text-foreground/80">
              <ShieldCheck className="w-4 h-4 text-green-500" /> Secure
            </div>
          </div>

          <Button 
            onClick={handlePayment} 
            disabled={isLoading || !isSdkLoaded}
            size="lg"
            className="w-full h-16 text-xl font-black bg-gradient-to-r from-primary to-blue-700 hover:to-blue-800 text-white rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:translate-y-[-2px] active:scale-95 transition-all duration-200"
          >
            {isLoading ? (
              <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> PROCEEDING...</>
            ) : (
              <><CreditCard className="w-6 h-6 mr-2" /> UNLOCK REPORT NOW</>
            )}
          </Button>

          {error && (
            <Alert variant="destructive" className="py-3 border-none bg-destructive/10">
              <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2 pt-2 grayscale opacity-70">
            <img src="/assets/payment-methods.png" alt="M-Pesa, Visa, Mastercard" className="h-6 object-contain hidden" />
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              M-Pesa & Cards Accepted
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportPaywall;
