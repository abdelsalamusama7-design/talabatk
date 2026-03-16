import { useState, useEffect } from "react";
import splashLogo from "@/assets/splash-logo.png";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 2800);
    const t3 = setTimeout(onFinish, 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 safe-area-pt safe-area-pb bg-primary ${phase >= 2 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      <img
        src={splashLogo}
        alt="talabatk"
        className={`w-[55vw] max-w-[280px] object-contain transition-all duration-500 ease-out ${phase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
      />
    </div>
  );
};

export default SplashScreen;
