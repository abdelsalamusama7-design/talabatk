import { useState, useEffect } from "react";
import { X, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/lang-context";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const { lang } = useLang();

  useEffect(() => {
    // Don't show if running inside Capacitor WebView or already installed
    if ((window as any).Capacitor?.isNativePlatform?.() || window.matchMedia("(display-mode: standalone)").matches) return;

    // Detect iOS
    const isIOSDevice = /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Show iOS prompt after a short delay
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome - listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Always show the prompt after delay even without beforeinstallprompt
    const fallbackTimer = setTimeout(() => setShowPrompt(true), 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't persist dismissal — show again on next visit
  };

  if (!showPrompt) return null;

  const isAr = lang === "ar";

  return (
    <div className="fixed bottom-24 inset-x-3 z-50 animate-in slide-in-from-bottom-6 duration-500">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl shadow-2xl p-[1px]">
        {/* Animated glow border */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/20 via-transparent to-primary-foreground/20 animate-pulse rounded-2xl" />
        
        <div className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/85 rounded-2xl p-4 backdrop-blur-sm">
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary-foreground/10 rounded-full" />
          <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-primary-foreground/5 rounded-full" />
          
          <div className="relative flex items-start gap-3">
            {/* App icon */}
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg border border-primary-foreground/10">
              <Download className="h-7 w-7 text-primary-foreground animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-primary-foreground text-[15px] leading-tight">
                {isAr ? "📲 حمّل تطبيق طلباتك" : "📲 Install Talabatk"}
              </h3>
              <p className="text-[12px] text-primary-foreground/75 mt-1 leading-relaxed">
                {isIOS
                  ? (isAr
                    ? "اضغط على زر المشاركة ↑ ثم \"إضافة للشاشة الرئيسية\""
                    : "Tap Share ↑ then \"Add to Home Screen\"")
                  : (isAr
                    ? "وصول أسرع • إشعارات فورية • يعمل بدون نت"
                    : "Faster access • Instant alerts • Works offline")}
              </p>
              {!isIOS && deferredPrompt && (
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="mt-2.5 h-9 text-xs rounded-xl font-bold bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-md px-5 gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isAr ? "ثبّت الآن مجاناً" : "Install Free Now"}
                </Button>
              )}
            </div>
            
            <button
              onClick={handleDismiss}
              className="text-primary-foreground/50 hover:text-primary-foreground p-1.5 flex-shrink-0 rounded-full hover:bg-primary-foreground/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
