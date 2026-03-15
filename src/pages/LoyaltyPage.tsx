import LoyaltyWidget from "@/components/LoyaltyWidget";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoyaltyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <div className="bg-primary pt-10 pb-6 px-4 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-primary-foreground">نقاط الولاء</h1>
          <button onClick={() => navigate(-1)} className="bg-primary-foreground/20 rounded-full p-2">
            <ArrowRight className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>
        <p className="text-primary-foreground/70 text-sm">اكسب نقاط مع كل طلب واستبدلها بخصومات</p>
      </div>
      <div className="px-4 pt-4">
        <LoyaltyWidget />
      </div>
    </div>
  );
};

export default LoyaltyPage;
