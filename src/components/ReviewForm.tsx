import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Star, Camera, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewFormProps {
  restaurantId: string;
  orderId?: string;
  onSubmitted?: () => void;
}

const ReviewForm = ({ restaurantId, orderId, onSubmitted }: ReviewFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة أكبر من 5 ميجا");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!user || rating === 0) {
      toast.error("اختر تقييم أولاً");
      return;
    }
    setSubmitting(true);

    let imageUrl: string | null = null;

    // Upload image if selected
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("review-images")
        .upload(path, imageFile);
      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from("review-images")
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      restaurant_id: restaurantId,
      order_id: orderId || null,
      rating,
      comment: comment.trim() || null,
      image_url: imageUrl,
    });

    if (error) {
      toast.error("حدث خطأ أثناء إرسال التقييم");
    } else {
      // Award loyalty points for review
      await supabase.from("loyalty_points").insert({
        user_id: user.id,
        points: 10,
        action: "تقييم مطعم",
        order_id: orderId || null,
      });
      toast.success("شكراً لتقييمك! 🎉 +10 نقاط ولاء");
      setRating(0);
      setComment("");
      setImageFile(null);
      setImagePreview(null);
      onSubmitted?.();
    }
    setSubmitting(false);
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-card rounded-2xl p-4 shadow-card"
    >
      <h3 className="font-semibold text-foreground mb-3 text-sm">قيّم تجربتك</h3>

      {/* Stars */}
      <div className="flex items-center gap-1 mb-3 justify-center">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => setRating(s)}
            onMouseEnter={() => setHoverRating(s)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                s <= (hoverRating || rating)
                  ? "text-warning fill-warning"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground mb-3">
        {rating === 1 && "😞 سيء"}
        {rating === 2 && "😐 مقبول"}
        {rating === 3 && "🙂 جيد"}
        {rating === 4 && "😊 ممتاز"}
        {rating === 5 && "🤩 رائع!"}
      </p>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="اكتب تعليقك (اختياري)..."
        className="w-full bg-muted rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none h-20 mb-3"
        maxLength={500}
      />

      {/* Image */}
      <div className="flex items-center gap-2 mb-3">
        <label className="flex items-center gap-1.5 text-sm text-primary cursor-pointer hover:underline">
          <Camera className="h-4 w-4" />
          أضف صورة
          <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
        </label>
        <AnimatePresence>
          {imagePreview && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="relative">
              <img src={imagePreview} alt="" className="w-14 h-14 rounded-xl object-cover" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        onClick={submit}
        disabled={rating === 0 || submitting}
        className="w-full rounded-xl h-10 font-semibold"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-1" />}
        إرسال التقييم
      </Button>
    </motion.div>
  );
};

export default ReviewForm;
