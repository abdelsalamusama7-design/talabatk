import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface ReviewsListProps {
  restaurantId: string;
  refreshKey?: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
}

const ReviewsList = ({ restaurantId, refreshKey }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        setReviews(data);
        if (data.length > 0) {
          setAvgRating(
            Math.round((data.reduce((sum, r) => sum + r.rating, 0) / data.length) * 10) / 10
          );
        }
      }
    };
    load();
  }, [restaurantId, refreshKey]);

  if (reviews.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          التقييمات ({reviews.length})
        </h3>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-warning fill-warning" />
          <span className="font-bold text-foreground tabular-nums">{avgRating}</span>
        </div>
      </div>

      {/* Review cards */}
      {reviews.map((review, i) => (
        <motion.div
          key={review.id}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="bg-card rounded-2xl p-3 shadow-card"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${
                    s <= review.rating ? "text-warning fill-warning" : "text-muted-foreground/20"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString("ar-EG")}
            </span>
          </div>
          {review.comment && (
            <p className="text-sm text-foreground mb-2">{review.comment}</p>
          )}
          {review.image_url && (
            <img
              src={review.image_url}
              alt="صورة التقييم"
              className="w-full h-40 object-cover rounded-xl"
              loading="lazy"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default ReviewsList;
