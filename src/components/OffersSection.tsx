import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Percent, Clock, Gift, Zap, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, typeof Flame> = {
  flame: Flame,
  gift: Gift,
  zap: Zap,
  clock: Clock,
  percent: Percent,
};

const gradientMap: Record<string, string> = {
  blue: "from-[hsl(199,89%,48%)] to-[hsl(199,89%,35%)]",
  green: "from-[hsl(152,69%,41%)] to-[hsl(152,69%,30%)]",
  orange: "from-[hsl(25,95%,53%)] to-[hsl(15,90%,45%)]",
  purple: "from-[hsl(280,70%,50%)] to-[hsl(260,70%,40%)]",
  red: "from-[hsl(0,84%,60%)] to-[hsl(0,84%,45%)]",
};

interface Offer {
  id: string;
  title: string;
  subtitle: string | null;
  discount: string;
  bg_color: string;
  icon: string;
  badge: string | null;
}

const OffersSection = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    supabase
      .from("offers")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setOffers(data as Offer[] || []));
  }, []);

  if (offers.length === 0) return null;

  return (
    <section className="px-4 mb-6" dir="rtl">
      <div className="flex items-center gap-2 mb-4">
        <Percent className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">عروض وتخفيضات 🎉</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {offers.map((offer, i) => {
          const Icon = iconMap[offer.icon] || Gift;
          const gradient = gradientMap[offer.bg_color] || gradientMap.blue;

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileTap={{ scale: 0.97 }}
              className={`relative min-w-[260px] snap-start rounded-2xl bg-gradient-to-br ${gradient} p-5 cursor-pointer overflow-hidden shadow-lg`}
              onClick={() => navigate("/")}
            >
              <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/10" />

              {offer.badge && (
                <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {offer.badge}
                </span>
              )}

              <div className="relative z-10">
                <Icon className="h-8 w-8 text-white/90 mb-3" />
                <p className="text-3xl font-black text-white mb-1">{offer.discount}</p>
                <h3 className="text-base font-bold text-white mb-1">{offer.title}</h3>
                <p className="text-xs text-white/80">{offer.subtitle}</p>
                <div className="flex items-center gap-1 mt-3 text-white/90 text-xs font-medium">
                  <span>اطلب الآن</span>
                  <ArrowLeft className="h-3 w-3" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default OffersSection;
