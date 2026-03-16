import { useState, useEffect } from "react";
import splashLogo from "@/assets/splash-logo.png";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 3500);
    const t3 = setTimeout(onFinish, 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div
      style={{ backgroundColor: '#1a9be0' }}
      className={`fixed inset-0 z-[9999] transition-opacity duration-600 ${phase >= 2 ? "opacity-0" : "opacity-100"}`}
    >
      <img
        src={splashLogo}
        alt="talabatk"
        className={`w-full h-full object-cover transition-all duration-500 ease-out ${phase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      />
    </div>
  );
};

export default SplashScreen;
