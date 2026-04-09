import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const hasShown = localStorage.getItem("pwa_prompt_shown");
      if (!hasShown) {
        setIsVisible(true);
      }
    };

    const triggerHandler = () => {
      if (deferredPrompt) {
        setIsVisible(true);
      } else {
        // If we don't have the prompt, maybe it's already installed or not supported
        console.log("PWA install prompt not available");
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("trigger-pwa-install", triggerHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("trigger-pwa-install", triggerHandler);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, so clear it
    setDeferredPrompt(null);
    setIsVisible(false);
    localStorage.setItem("pwa_prompt_shown", "true");
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Suppress for 7 days
    localStorage.setItem("pwa_prompt_shown", "true");
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-[100] sm:left-auto sm:right-6 sm:w-80"
        >
          <div className="bg-card/95 backdrop-blur-xl border border-primary/20 p-5 rounded-2xl shadow-2xl flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 text-foreground-muted hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold tracking-tight">Install CareerGuide AI</h4>
                <p className="text-xs text-foreground-muted font-medium leading-relaxed">
                  Add to your home screen for faster access and a better experience.
                </p>
              </div>
            </div>

            <Button 
              onClick={handleInstallClick}
              className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-bold shadow-glow h-11 rounded-xl relative z-10"
            >
              <Download className="w-4 h-4 mr-2" />
              Install Now
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
