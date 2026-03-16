import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { stores } from "@/lib/data";
import { Flame, Sparkles, TrendingUp, RefreshCw, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TrendingMeal {
  id: string;
  meal_name: string;
  meal_description: string | null;
  restaurant_name: string | null;
  price: number | null;
  image_url: string | null;
  score: number | null;
  reason: string | null;
  prediction_date: string;
}

const SCORE_EMOJIS = ["🔥", "⭐", "💎", "🏆", "✨"];

const TrendingMeals = () => {
  const navigate = useNavigate();
  const [meals, setMeals] = useState<TrendingMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrending = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("trending_meals")
      .select("*")
      .eq("prediction_date", today)
      .order("score", { ascending: false });

    if (data && data.length > 0) {
      setMeals(data);
    }
    setLoading(false);
  };

  const generatePredictions = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("predict-trending");
      if (!error && data?.success) {
        await fetchTrending();
      }
    } catch (e) {
      console.error("Failed to generate predictions:", e);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTrending().then(() => {
      // Auto-generate if no predictions for today
      const today = new Date().toISOString().split("T")[0];
      supabase
        .from("trending_meals")
        .select("id")
        .eq("prediction_date", today)
        .limit(1)
        .then(({ data }) => {
          if (!data || data.length === 0) {
            generatePredictions();
          }
        });
    });
  }, []);

  if (loading && meals.length === 0) {
    return (
      <section className="px-4 mb-6" dir="rtl">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold text-foreground">الأكثر رواجاً اليوم</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[200px] h-[160px] bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (meals.length === 0 && !refreshing) return null;

  return (
    <section className="px-4 mb-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Flame className="h-5 w-5 text-destructive" />
          </motion.div>
          <h2 className="text-lg font-semibold text-foreground">الأكثر رواجاً اليوم</h2>
          <span className="bg-destructive/10 text-destructive text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> AI
          </span>
        </div>
        <button
          onClick={generatePredictions}
          disabled={refreshing}
          className="text-primary text-xs flex items-center gap-1"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          تحديث
        </button>
      </div>

      {/* Scrollable cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <AnimatePresence>
          {meals.map((meal, index) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="min-w-[200px] bg-card rounded-2xl shadow-card overflow-hidden shrink-0 relative cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
              onClick={() => {
                // Try to find a matching local store by name
                const matchedStore = stores.find(s => 
                  meal.restaurant_name && s.name.includes(meal.restaurant_name)
                );
                if (matchedStore) {
                  navigate(`/store/${matchedStore.id}`);
                } else if (meal.restaurant_id) {
                  navigate(`/store/${meal.restaurant_id}`);
                }
              }}
            >
              {/* Rank badge */}
              <div className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg">
                {index + 1}
              </div>

              {/* Gradient header */}
              <div className="h-20 bg-gradient-to-bl from-primary/20 via-accent to-destructive/10 flex items-center justify-center relative">
                <span className="text-4xl">{SCORE_EMOJIS[index] || "🍽️"}</span>
                {meal.score && Number(meal.score) >= 8 && (
                  <motion.div
                    className="absolute top-2 left-2"
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <TrendingUp className="h-4 w-4 text-success" />
                  </motion.div>
                )}
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="font-bold text-sm text-foreground leading-tight mb-0.5">
                  {meal.meal_name}
                </h3>
                {meal.restaurant_name && (
                  <p className="text-[11px] text-muted-foreground mb-1">{meal.restaurant_name}</p>
                )}
                {meal.reason && (
                  <span className="inline-block bg-warning/10 text-warning text-[10px] px-2 py-0.5 rounded-full font-medium mb-1.5">
                    {meal.reason}
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">
                    {meal.price ? `${meal.price} ج.م` : "—"}
                  </span>
                  {meal.score && (
                    <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                      <Star className="h-3 w-3 text-warning fill-warning" />
                      {Number(meal.score).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {refreshing && meals.length === 0 && (
          <div className="min-w-full flex items-center justify-center py-8">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
              </motion.div>
              <p className="text-sm text-muted-foreground">الذكاء الاصطناعي يحلل الاتجاهات...</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingMeals;
