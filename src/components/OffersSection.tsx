import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Percent, Clock, Gift, Zap, ArrowLeft, Timer, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";

const iconMap: Record<string, typeof Flame> = {
  flame: Flame, gift: Gift, zap: Zap, clock: Clock, percent: Percent,
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
  expires_at: string | null;
  promo_code_id: string | null;
  promo_code?: string | null;
}

const useCountdown = (offers: Offer[]) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const hasExpiry = offers.some((o) => o.expires_at);
    if (!hasExpiry) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [offers]);

  const getTimeLeft = useCallback((expiresAt: string | null) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds, total: diff };
  }, [now]);

  return getTimeLeft;
};

const CountdownDisplay = ({ timeLeft }: { timeLeft: { days: number; hours: number; minutes: number; seconds: number } }) => (
  <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm rounded-xl px-3 py-1.5">
    <Timer className="h-3.5 w-3.5 text-white/90 ml-1" />
    <div className="flex items-center gap-1 text-white font-mono text-sm font-bold" dir="ltr">
      {timeLeft.days > 0 && (
        <>
          <span className="bg-white/20 rounded px-1.5 py-0.5 min-w-[28px] text-center">{timeLeft.days}</span>
          <span className="text-white/60 text-[10px]">ي</span>
        </>
      )}
      <span className="bg-white/20 rounded px-1.5 py-0.5 min-w-[28px] text-center">{String(timeLeft.hours).padStart(2, "0")}</span>
      <span className="text-white/70">:</span>
      <span className="bg-white/20 rounded px-1.5 py-0.5 min-w-[28px] text-center">{String(timeLeft.minutes).padStart(2, "0")}</span>
      <span className="text-white/70">:</span>
      <span className="bg-white/20 rounded px-1.5 py-0.5 min-w-[28px] text-center">{String(timeLeft.seconds).padStart(2, "0")}</span>
    </div>
  </div>
);

const PromoCodeChip = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`تم نسخ الكود: ${code}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 hover:bg-white/30 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5 text-white/80" />}
      <span className="text-white font-bold text-sm tracking-wider font-mono" dir="ltr">{code}</span>
    </button>
  );
};

const OffersSection = () => {
  const navigate = useNavigate();
  const { setPendingPromoCode } = useCart();
  const [offers, setOffers] = useState<Offer[]>([]);
  const getTimeLeft = useCountdown(offers);

  const handleOfferClick = (offer: Offer) => {
    if (offer.promo_code) {
      setPendingPromoCode(offer.promo_code);
      toast.success(`سيتم تطبيق كود "${offer.promo_code}" تلقائياً في السلة`);
      navigate("/cart");
    }
  };

  useEffect(() => {
    const loadOffers = async () => {
      const { data: offersData } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (!offersData) return;

      // Fetch linked promo codes
      const promoIds = offersData
        .filter((o: any) => o.promo_code_id)
        .map((o: any) => o.promo_code_id);

      let promoMap: Record<string, string> = {};
      if (promoIds.length > 0) {
        const { data: codes } = await supabase
          .from("promo_codes")
          .select("id, code")
          .in("id", promoIds);
        if (codes) {
          promoMap = Object.fromEntries(codes.map((c: any) => [c.id, c.code]));
        }
      }

      const active = (offersData as Offer[]).filter((o) => {
        if (!o.expires_at) return true;
        return new Date(o.expires_at).getTime() > Date.now();
      }).map((o) => ({
        ...o,
        promo_code: o.promo_code_id ? promoMap[o.promo_code_id] || null : null,
      }));

      setOffers(active);
    };

    loadOffers();
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
          const timeLeft = getTimeLeft(offer.expires_at);

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileTap={{ scale: 0.97 }}
              className={`relative min-w-[270px] snap-start rounded-2xl bg-gradient-to-br ${gradient} p-5 cursor-pointer overflow-hidden shadow-lg`}
              onClick={() => handleOfferClick(offer)}
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

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {offer.promo_code && <PromoCodeChip code={offer.promo_code} />}
                  {timeLeft && <CountdownDisplay timeLeft={timeLeft} />}
                  {!offer.promo_code && !timeLeft && (
                    <div className="flex items-center gap-1 text-white/90 text-xs font-medium">
                      <span>اطلب الآن</span>
                      <ArrowLeft className="h-3 w-3" />
                    </div>
                  )}
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
