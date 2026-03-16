import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Smartphone, Share, ArrowRight, CheckCircle, Wifi, WifiOff, Bell, MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPage = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const features = [
    { icon: Zap, label: "سرعة فائقة", desc: "تحميل فوري بدون انتظار" },
    { icon: WifiOff, label: "يعمل بدون إنترنت", desc: "تصفح حتى بدون اتصال" },
    { icon: Bell, label: "إشعارات فورية", desc: "تتبع طلبك لحظة بلحظة" },
    { icon: MapPin, label: "تتبع GPS", desc: "شاهد المندوب على الخريطة" },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-primary pt-12 pb-10 px-6 rounded-b-[2.5rem] text-center relative">
        <button onClick={() => navigate("/")} className="absolute top-12 left-4 bg-card/20 rounded-full p-2">
          <ArrowRight className="h-5 w-5 text-primary-foreground rotate-180" />
        </button>
        <div className="w-20 h-20 rounded-2xl bg-card/20 mx-auto mb-4 flex items-center justify-center">
          <Smartphone className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-primary-foreground mb-2">حمّل تطبيق طلباتك</h1>
        <p className="text-primary-foreground/80 text-sm">ثبّت التطبيق على هاتفك وتمتع بتجربة أسرع</p>
      </div>

      <div className="px-6 py-8 space-y-6">
        {/* Status */}
        {isInstalled && (
          <div className="bg-success/10 border border-success/20 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-success" />
            <div>
              <p className="font-semibold text-success">التطبيق مثبت بالفعل!</p>
              <p className="text-sm text-muted-foreground">يمكنك فتحه من الشاشة الرئيسية</p>
            </div>
          </div>
        )}

        {/* Install button */}
        {!isInstalled && deferredPrompt && (
          <Button onClick={handleInstall} className="w-full h-14 rounded-2xl text-lg font-bold gap-3">
            <Download className="h-6 w-6" />
            تثبيت التطبيق الآن
          </Button>
        )}

        {/* iOS instructions */}
        {!isInstalled && isIOS && !deferredPrompt && (
          <div className="bg-card rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-foreground text-center">كيفية التثبيت على iPhone</h3>
            <div className="space-y-3">
              {[
                { step: 1, text: "اضغط على زر المشاركة", icon: Share },
                { step: 2, text: "اختر \"إضافة إلى الشاشة الرئيسية\"", icon: Download },
                { step: 3, text: "اضغط \"إضافة\" للتأكيد", icon: CheckCircle },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    {s.step}
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{s.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">مميزات التطبيق</h3>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => (
              <div key={f.label} className="bg-card rounded-2xl p-4 shadow-card text-center">
                <f.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">{f.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Native apps & Direct Install section */}
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <h3 className="font-semibold text-foreground mb-2">تطبيقات الهاتف الأصلية</h3>
          <p className="text-sm text-muted-foreground mb-4">
            تطبيقات Android و iOS الأصلية قيد التطوير وستكون متاحة قريباً على المتاجر
          </p>
          <div className="flex gap-3">
            <div className="flex-1 bg-muted/50 rounded-xl p-3 text-center opacity-60">
              <p className="text-xs font-medium text-foreground">Google Play</p>
              <p className="text-[10px] text-muted-foreground">قريباً</p>
            </div>
            <div className="flex-1 bg-muted/50 rounded-xl p-3 text-center opacity-60">
              <p className="text-xs font-medium text-foreground">App Store</p>
              <p className="text-[10px] text-muted-foreground">قريباً</p>
            </div>
            <button
              onClick={() => {
                if (isIOS) {
                  // Show iOS instructions
                  alert("اضغط على زر المشاركة ⬆️ ثم اختر \"إضافة إلى الشاشة الرئيسية\"");
                } else {
                  handleInstall();
                }
              }}
              disabled={isInstalled}
              className="flex-1 bg-primary rounded-xl p-3 text-center text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download className="h-5 w-5 mx-auto mb-0.5" />
              <p className="text-xs font-bold">تحميل مباشر</p>
              <p className="text-[10px] opacity-80">{isInstalled ? "مثبت ✓" : "ثبّت الآن"}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPage;
