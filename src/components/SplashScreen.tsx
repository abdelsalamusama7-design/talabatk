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
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-600 ${phase >= 2 ? "opacity-0" : "opacity-100"}`}
      style={{ backgroundColor: "#1a9be0" }}
    >
      <img
        src={splashLogo}
        alt="talabatk"
        className={`w-full h-full object-contain transition-all duration-500 ease-out ${phase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
        style={{ padding: "15vh 10vw" }}
      />
    </div>
  );
};

export default SplashScreen;
