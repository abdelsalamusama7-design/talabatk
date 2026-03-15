import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Percent, Clock, Gift, Zap, ArrowLeft } from "lucide-react";

interface Offer {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  bgGradient: string;
  icon: typeof Flame;
  badge?: string;
}

const offers: Offer[] = [
  {
    id: "1",
    title: "خصم على أول طلب",
    subtitle: "سجّل الآن واحصل على خصم فوري",
    discount: "25%",
    bgGradient: "from-[hsl(199,89%,48%)] to-[hsl(199,89%,35%)]",
    icon: Gift,
    badge: "جديد",
  },
  {
    id: "2",
    title: "توصيل مجاني",
    subtitle: "على الطلبات فوق 100 جنيه",
    discount: "مجاني",
    bgGradient: "from-[hsl(152,69%,41%)] to-[hsl(152,69%,30%)]",
    icon: Zap,
  },
  {
    id: "3",
    title: "عرض الغداء",
    subtitle: "من 12 ظهراً لـ 4 عصراً يومياً",
    discount: "15%",
    bgGradient: "from-[hsl(25,95%,53%)] to-[hsl(15,90%,45%)]",
    icon: Clock,
    badge: "يومي",
  },
  {
    id: "4",
    title: "اطلب 3 وادفع 2",
    subtitle: "على وجبات مختارة من مطاعمنا",
    discount: "3=2",
    bgGradient: "from-[hsl(280,70%,50%)] to-[hsl(260,70%,40%)]",
    icon: Flame,
    badge: "🔥 حصري",
  },
];

const OffersSection = () => {
  const navigate = useNavigate();

  return (
    <section className="px-4 mb-6" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">عروض وتخفيضات 🎉</h2>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {offers.map((offer, i) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileTap={{ scale: 0.97 }}
            className={`relative min-w-[260px] snap-start rounded-2xl bg-gradient-to-br ${offer.bgGradient} p-5 cursor-pointer overflow-hidden shadow-lg`}
            onClick={() => navigate("/")}
          >
            {/* Decorative circles */}
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/10" />

            {offer.badge && (
              <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {offer.badge}
              </span>
            )}

            <div className="relative z-10">
              <offer.icon className="h-8 w-8 text-white/90 mb-3" />
              <p className="text-3xl font-black text-white mb-1">{offer.discount}</p>
              <h3 className="text-base font-bold text-white mb-1">{offer.title}</h3>
              <p className="text-xs text-white/80">{offer.subtitle}</p>

              <div className="flex items-center gap-1 mt-3 text-white/90 text-xs font-medium">
                <span>اطلب الآن</span>
                <ArrowLeft className="h-3 w-3" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default OffersSection;
