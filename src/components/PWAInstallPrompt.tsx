import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
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

    // Check if dismissed in this session only
    const dismissed = sessionStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) return;

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
    return () => window.removeEventListener("beforeinstallprompt", handler);
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
    sessionStorage.setItem("pwa-prompt-dismissed", "1");
  };

  if (!showPrompt) return null;

  const isAr = lang === "ar";

  return (
    <div className="fixed bottom-24 inset-x-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 flex items-start gap-3 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Download className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-sm">
            {isAr ? "حمّل تطبيق طلباتك" : "Install Talabatk App"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isIOS
              ? (isAr
                ? "اضغط على زر المشاركة ↑ ثم \"إضافة إلى الشاشة الرئيسية\""
                : "Tap Share ↑ then \"Add to Home Screen\"")
              : (isAr
                ? "ثبّت التطبيق على موبايلك للوصول السريع"
                : "Install the app for quick access")}
          </p>
          {!isIOS && deferredPrompt && (
            <Button
              size="sm"
              onClick={handleInstall}
              className="mt-2 h-8 text-xs rounded-lg"
            >
              {isAr ? "تثبيت الآن" : "Install Now"}
            </Button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground p-1 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
