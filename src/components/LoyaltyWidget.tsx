import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Gift, Star, Coins, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

const LoyaltyWidget = ({ compact = false }: { compact?: boolean }) => {
  const { user } = useAuth();
  const [totalPoints, setTotalPoints] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("loyalty_points")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) {
        setHistory(data);
        setTotalPoints(data.reduce((sum, p) => sum + p.points, 0));
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (!user || loading) return null;

  const tier = totalPoints >= 500 ? "ذهبي" : totalPoints >= 200 ? "فضي" : "برونزي";
  const tierColor = totalPoints >= 500 ? "text-warning" : totalPoints >= 200 ? "text-muted-foreground" : "text-amber-700";
  const tierBg = totalPoints >= 500 ? "bg-warning/10" : totalPoints >= 200 ? "bg-muted" : "bg-amber-50 dark:bg-amber-950/20";
  const nextTier = totalPoints >= 500 ? null : totalPoints >= 200 ? 500 : 200;
  const progress = nextTier ? (totalPoints / nextTier) * 100 : 100;

  if (compact) {
    return (
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-card rounded-2xl p-4 shadow-card"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${tierBg} flex items-center justify-center`}>
              <Coins className={`h-5 w-5 ${tierColor}`} />
            </div>
            <div>
              <p className="font-bold text-foreground tabular-nums">{totalPoints} نقطة</p>
              <p className={`text-xs font-medium ${tierColor}`}>عضو {tier} ⭐</p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-xs text-muted-foreground">يمكنك استبدال</p>
            <p className="font-bold text-primary tabular-nums">{Math.floor(totalPoints / 10)} ج.م</p>
          </div>
        </div>
        {nextTier && (
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>{totalPoints} نقطة</span>
              <span>{nextTier} نقطة للمستوى التالي</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Points card */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">رصيد النقاط</p>
            <p className="text-3xl font-bold tabular-nums">{totalPoints}</p>
          </div>
          <div className={`px-3 py-1 rounded-full bg-primary-foreground/20 text-sm font-semibold`}>
            ⭐ عضو {tier}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="opacity-80">يمكنك استبدال حتى</span>
          <span className="font-bold">{Math.floor(totalPoints / 10)} ج.م خصم</span>
        </div>
        {nextTier && (
          <div className="mt-3">
            <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-foreground rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-xs opacity-70 mt-1">{nextTier - totalPoints} نقطة للمستوى التالي</p>
          </div>
        )}
      </div>

      {/* Rewards */}
      <div className="bg-card rounded-2xl p-4 shadow-card">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Gift className="h-4 w-4 text-primary" /> مكافآت متاحة
        </h3>
        <div className="space-y-2">
          {[
            { points: 50, reward: "خصم 5 ج.م", emoji: "🎁" },
            { points: 100, reward: "خصم 10 ج.م", emoji: "🎉" },
            { points: 200, reward: "توصيل مجاني", emoji: "🚀" },
            { points: 500, reward: "خصم 50 ج.م", emoji: "💎" },
          ].map((r) => (
            <div key={r.points} className={`flex items-center justify-between p-3 rounded-xl ${totalPoints >= r.points ? "bg-success/10 border border-success/20" : "bg-muted/50"}`}>
              <div className="flex items-center gap-2">
                <span>{r.emoji}</span>
                <span className="text-sm font-medium text-foreground">{r.reward}</span>
              </div>
              <span className={`text-xs font-semibold ${totalPoints >= r.points ? "text-success" : "text-muted-foreground"}`}>
                {totalPoints >= r.points ? "متاح ✓" : `${r.points} نقطة`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="font-semibold text-foreground mb-3">سجل النقاط</h3>
          <div className="space-y-2">
            {history.slice(0, 10).map((h) => (
              <div key={h.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold tabular-nums ${h.points > 0 ? "text-success" : "text-destructive"}`}>
                    {h.points > 0 ? `+${h.points}` : h.points}
                  </span>
                  <span className="text-muted-foreground">{h.action}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(h.created_at).toLocaleDateString("ar-EG")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyWidget;
