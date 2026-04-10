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
    <Card className="bg-gradient-to-br from-primary/10 to-blue-600/5 border-primary/20 shadow-xl overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          
          <h3 className="text-2xl font-bold tracking-tight">Unlock Your Full Diagnostic Report</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Access your complete MBTI profile, RIASEC scores, and personalized 12-month career action plan.
          </p>

          <div className="flex items-baseline gap-1 my-4">
            <span className="text-sm font-semibold text-muted-foreground">KSh</span>
            <span className="text-5xl font-black text-primary">{PAYMENT_AMOUNT}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-6">
            <div className="flex items-center gap-2 text-[13px] font-medium text-foreground-muted">
              <Zap className="w-4 h-4 text-amber-500" /> Instant Access
            </div>
            <div className="flex items-center gap-2 text-[13px] font-medium text-foreground-muted">
              <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Payment
            </div>
          </div>

          <Button 
            onClick={handlePayment} 
            disabled={isLoading || !isSdkLoaded}
            size="lg"
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow hover:scale-[1.01] transition-all"
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><CreditCard className="w-5 h-5 mr-2" /> Pay KSh {PAYMENT_AMOUNT} to Unlock</>
            )}
          </Button>

          {error && (
            <Alert variant="destructive" className="mt-4 py-2 border-none bg-destructive/10">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <p className="text-[11px] text-muted-foreground pt-2">
            Powered by IntaSend. M-Pesa & All Cards Accepted.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportPaywall;
