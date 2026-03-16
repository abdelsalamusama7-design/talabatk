import { useState, useEffect } from "react";
import splashLogo from "@/assets/splash-logo.png";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase dset, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 2800);
    const t3 = setTimeout(onFinish, 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-opacity duration-500 ${phase >= 2 ? "opacity-0" : "opacity-100"}`}
      style={{ backgroundColor: "#2E78B7" }}
    >
      <img
        src={splashLogo}
        alt="talabatk"
        className={`w-full h-full object-cover transition-all duration-400 ease-out ${phase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      />
    </div>
  );
};

export default SplashScreen;
