import { useState, useEffect } from "react";
import { Bike, MapPin, ShoppingBag } from "lucide-react";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState(0); // 0: logo, 1: tagline, 2: icons, 3: fade out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => setPhase(3), 4200);
    const t4 = setTimeout(onFinish, 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary transition-opacity duration-700 ${phase >= 3 ? "opacity-0" : "opacity-100"}`}
    >
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary-foreground/5 animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-primary-foreground/5 animate-pulse" style={{ animationDelay: "0.5s" }} />
        <div className="absolute top-1/4 left-10 w-20 h-20 rounded-full bg-primary-foreground/5 animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Logo */}
      <div
        className={`relative transition-all duration-700 ease-out ${phase >= 0 ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
      >
        <div className="w-28 h-28 rounded-3xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-primary-foreground/10">
          <ShoppingBag className="w-14 h-14 text-primary-foreground" strokeWidth={1.5} />
        </div>
      </div>

      {/* App name */}
      <h1
        className={`mt-8 text-4xl font-bold text-primary-foreground tracking-tight transition-all duration-700 ease-out ${phase >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        style={{ transitionDelay: "300ms" }}
      >
        طلباتك
      </h1>

      {/* Tagline */}
      <p
        className={`mt-3 text-primary-foreground/80 text-lg font-medium transition-all duration-500 ease-out ${phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        اطلب أي حاجة.. توصلك بسرعة 🚀
      </p>

      {/* Animated icons */}
      <div
        className={`flex items-center gap-8 mt-10 transition-all duration-700 ease-out ${phase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        {[
          { icon: ShoppingBag, label: "تسوق", delay: "0ms" },
          { icon: Bike, label: "توصيل", delay: "150ms" },
          { icon: MapPin, label: "تتبع", delay: "300ms" },
        ].map(({ icon: Icon, label, delay }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 transition-all duration-500"
            style={{ transitionDelay: delay }}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/15 flex items-center justify-center border border-primary-foreground/10">
              <Icon className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-xs text-primary-foreground/70 font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Loading bar */}
      <div className="absolute bottom-16 w-48 h-1 rounded-full bg-primary-foreground/10 overflow-hidden">
        <div
          className="h-full bg-primary-foreground/50 rounded-full transition-all ease-linear"
          style={{ width: phase >= 3 ? "100%" : `${(phase + 1) * 25}%`, transitionDuration: phase >= 2 ? "2400ms" : "800ms" }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
