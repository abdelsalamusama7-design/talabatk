import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Percent, Clock, Gift, Zap, ArrowRight, Timer, Copy, Check, ShoppingBag, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import { stores } from "@/lib/data";

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

const OffersPage = () => {
  const navigate = useNavigate();
  const { setPendingPromoCode } = useCart();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeLeft = useCallback((expiresAt: string | null) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds };
  }, [now]);

  useEffect(() => {
    const loadOffers = async () => {
      const { data: offersData } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (!offersData) return;

      const promoIds = offersData.filter((o: any) => o.promo_code_id).map((o: any) => o.promo_code_id);
      let promoMap: Record<string, string> = {};
      if (promoIds.length > 0) {
        const { data: codes } = await supabase.from("promo_codes").select("id, code").in("id", promoIds);
        if (codes) promoMap = Object.fromEntries(codes.map((c: any) => [c.id, c.code]));
      }

      const active = (offersData as Offer[])
        .filter((o) => !o.expires_at || new Date(o.expires_at).getTime() > Date.now())
        .map((o) => ({ ...o, promo_code: o.promo_code_id ? promoMap[o.promo_code_id] || null : null }));

      setOffers(active);
    };
    loadOffers();
  }, []);

  const handleUseOffer = (offer: Offer) => {
    if (offer.promo_code) {
      setPendingPromoCode(offer.promo_code);
      toast.success(`سيتم تطبيق كود "${offer.promo_code}" تلقائياً في السلة`);
    }
    navigate("/");
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(`تم نسخ الكود: ${code}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
            <ArrowRight className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">العروض والتخفيضات 🎉</h1>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Gift className="h-16 w-16 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">لا توجد عروض حالياً</p>
            <p className="text-sm mt-1">تابعنا للحصول على أحدث العروض</p>
          </div>
        )}

        {offers.map((offer, i) => {
          const Icon = iconMap[offer.icon] || Gift;
          const gradient = gradientMap[offer.bg_color] || gradientMap.blue;
          const timeLeft = getTimeLeft(offer.expires_at);

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`relative rounded-2xl bg-gradient-to-br ${gradient} p-6 overflow-hidden shadow-lg`}
            >
              {/* Decorative circles */}
              <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10" />

              {offer.badge && (
                <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full">
                  {offer.badge}
                </span>
              )}

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Icon className="h-10 w-10 text-white/90 mb-3" />
                    <p className="text-4xl font-black text-white mb-2">{offer.discount}</p>
                    <h3 className="text-lg font-bold text-white mb-1">{offer.title}</h3>
                    <p className="text-sm text-white/80">{offer.subtitle}</p>
                  </div>
                </div>

                {/* Countdown */}
                {timeLeft && (
                  <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm rounded-xl px-3 py-2 w-fit mb-4">
                    <Timer className="h-4 w-4 text-white/90 ml-1" />
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
                )}

                {/* Promo code + Order button */}
                <div className="flex flex-wrap items-center gap-3">
                  {offer.promo_code && (
                    <button
                      onClick={() => handleCopy(offer.promo_code!, offer.id)}
                      className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/30 transition-colors"
                    >
                      {copiedId === offer.id ? <Check className="h-4 w-4 text-white" /> : <Copy className="h-4 w-4 text-white/80" />}
                      <span className="text-white font-bold text-sm tracking-wider font-mono" dir="ltr">{offer.promo_code}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleUseOffer(offer)}
                    className="flex items-center gap-2 bg-white text-foreground font-bold rounded-xl px-5 py-2.5 hover:bg-white/90 transition-colors shadow-md"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>اطلب الآن</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        </div>
      </div>

      {/* Browse stores section */}
      <div className="px-4 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <Store className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">تصفح المتاجر</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stores.slice(0, 6).map((store) => (
            <button
              key={store.id}
              onClick={() => navigate(`/store/${store.id}`)}
              className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border"
            >
              <img src={store.image} alt={store.name} className="w-full h-24 object-cover" />
              <div className="p-2.5">
                <p className="text-sm font-semibold text-foreground truncate">{store.name}</p>
                <p className="text-xs text-muted-foreground">{store.deliveryTime}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OffersPage;
