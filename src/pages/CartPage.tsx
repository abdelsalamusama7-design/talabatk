import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useGeolocation } from "@/hooks/use-geolocation";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus, Minus, ShoppingBag, MapPin, Tag, FileText, Loader2, Zap, TrendingUp, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CartPage = () => {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart();
  const { user } = useAuth();
  const { address, lat, lng, requestLocation, loading: geoLoading } = useGeolocation();
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [dynamicFee, setDynamicFee] = useState<number | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeDetails, setFeeDetails] = useState<{ distance_km: number; is_peak: boolean; demand_level: string } | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);

  const deliveryFee = dynamicFee ?? (items.length > 0 ? items[0].store.deliveryFee : 0);
  const grandTotal = Math.max(0, total + deliveryFee - discount - loyaltyDiscount);

  // Load loyalty points
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("loyalty_points")
        .select("points")
        .eq("user_id", user.id);
      if (data) setLoyaltyPoints(data.reduce((s, p) => s + p.points, 0));
    };
    load();
  }, [user]);

  // Fetch dynamic pricing when location or items change
  useEffect(() => {
    const fetchFee = async () => {
      if (!lat || !lng || items.length === 0) return;
      const storeName = items[0]?.store.name;
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("name", storeName)
        .maybeSingle();
      if (!restaurant?.id) return;

      setFeeLoading(true);
      try {
        const { data } = await supabase.functions.invoke("calculate-delivery-fee", {
          body: { restaurant_id: restaurant.id, customer_lat: lat, customer_lng: lng },
        });
        if (data?.delivery_fee) {
          setDynamicFee(data.delivery_fee);
          setFeeDetails({ distance_km: data.distance_km, is_peak: data.is_peak, demand_level: data.demand_level });
        }
      } catch { /* fallback to static fee */ }
      setFeeLoading(false);
    };
    fetchFee();
  }, [lat, lng, items.length]);

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    const { data } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", promoCode.trim().toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (!data) {
      toast.error("كود الخصم غير صالح");
      return;
    }
    if (data.min_order && total < Number(data.min_order)) {
      toast.error(`الحد الأدنى للطلب ${data.min_order} ج.م`);
      return;
    }
    if (data.max_uses && data.used_count >= data.max_uses) {
      toast.error("تم استنفاد كود الخصم");
      return;
    }

    const disc = data.discount_type === "percentage"
      ? (total * Number(data.discount_value)) / 100
      : Number(data.discount_value);
    setDiscount(Math.min(disc, total));
    setPromoApplied(true);
    toast.success(`تم تطبيق خصم ${data.discount_type === "percentage" ? `${data.discount_value}%` : `${data.discount_value} ج.م`}`);
  };

  const handleOrder = async () => {
    if (!user) {
      toast.error("سجل دخولك أولاً");
      navigate("/auth");
      return;
    }

    setOrdering(true);
    try {
      // Find restaurant in DB or use a placeholder
      const storeName = items[0]?.store.name;
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("name", storeName)
        .maybeSingle();

      const restaurantId = restaurant?.id;
      if (!restaurantId) {
        toast.error("المطعم غير متوفر حالياً في النظام");
        setOrdering(false);
        return;
      }

      const orderItems = items.map((i) => ({
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      }));

      const { data: order, error } = await supabase.from("orders").insert({
        customer_id: user.id,
        restaurant_id: restaurantId,
        items: orderItems,
        subtotal: total,
        delivery_fee: deliveryFee,
        total: grandTotal,
        delivery_address: address,
        delivery_lat: lat,
        delivery_lng: lng,
        notes: notes || null,
        status: "pending",
      }).select().single();

      if (error) throw error;

      // Try to auto-assign driver
      try {
        await supabase.functions.invoke("assign-driver", {
          body: { order_id: order.id },
        });
      } catch {
        // Driver assignment is best-effort
      }

      // Award loyalty points (1 point per 10 EGP)
      const earnedPoints = Math.floor(grandTotal / 10);
      if (earnedPoints > 0) {
        try {
          await supabase.from("loyalty_points").insert({
            user_id: user.id,
            points: earnedPoints,
            action: `طلب من ${storeName}`,
            order_id: order.id,
          });
        } catch { /* best effort */ }
      }

      toast.success(`تم تأكيد الطلب بنجاح! 🎉 +${earnedPoints} نقاط ولاء`);
      clearCart();
      setDiscount(0);
      setPromoApplied(false);
      setNotes("");
      navigate("/orders");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء إنشاء الطلب");
    } finally {
      setOrdering(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-20 px-4" dir="rtl">
        <ShoppingBag className="h-20 w-20 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">السلة فارغة</h2>
        <p className="text-muted-foreground text-sm mb-6">أضف منتجات من المتاجر للبدء</p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          تصفح المتاجر
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28" dir="rtl">
      <div className="pt-12 px-4">
        <h1 className="text-2xl font-bold mb-6">السلة</h1>

        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.product.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-card rounded-2xl p-4 shadow-card mb-3 flex items-center gap-4"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{item.product.name}</h3>
                <p className="text-xs text-muted-foreground">{item.store.name}</p>
                <p className="text-primary font-bold mt-1 tabular-nums">{item.product.price * item.quantity} ج.م</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-semibold tabular-nums w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="h-8 w-8 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mr-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Delivery Address */}
        <div className="bg-card rounded-2xl p-4 shadow-card mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" /> عنوان التوصيل
            </span>
            <button
              onClick={requestLocation}
              disabled={geoLoading}
              className="text-xs text-primary font-medium"
            >
              {geoLoading ? "جارٍ التحديد..." : "📍 تحديد موقعي"}
            </button>
          </div>
          <p className="text-sm text-muted-foreground">{address}</p>
        </div>

        {/* Notes */}
        <div className="bg-card rounded-2xl p-4 shadow-card mt-3">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
            <FileText className="h-4 w-4 text-primary" /> ملاحظات
          </label>
          <Input
            placeholder="مثال: بدون بصل، الدور الثالث..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rounded-xl h-10"
            maxLength={500}
          />
        </div>

        {/* Promo Code */}
        <div className="bg-card rounded-2xl p-4 shadow-card mt-3">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
            <Tag className="h-4 w-4 text-primary" /> كود خصم
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="أدخل كود الخصم"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="rounded-xl h-10 flex-1"
              disabled={promoApplied}
              maxLength={20}
            />
            <Button
              onClick={applyPromo}
              disabled={promoApplied || !promoCode.trim()}
              size="sm"
              className="rounded-xl h-10 px-4"
            >
              {promoApplied ? "✓" : "تطبيق"}
            </Button>
          </div>
          {promoApplied && (
            <p className="text-xs text-success mt-1.5">✅ تم تطبيق خصم {discount} ج.م</p>
          )}
        </div>

        {/* Loyalty Points Redemption */}
        {user && loyaltyPoints >= 50 && (
          <div className="bg-card rounded-2xl p-4 shadow-card mt-3">
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
              <Coins className="h-4 w-4 text-warning" /> استبدال نقاط الولاء
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              لديك {loyaltyPoints} نقطة (= {Math.floor(loyaltyPoints / 10)} ج.م)
            </p>
            <div className="flex gap-2">
              {[50, 100, 200].filter(p => loyaltyPoints >= p).map(pts => {
                const disc = Math.floor(pts / 10);
                return (
                  <Button
                    key={pts}
                    size="sm"
                    variant={loyaltyDiscount === disc ? "default" : "outline"}
                    onClick={() => setLoyaltyDiscount(loyaltyDiscount === disc ? 0 : disc)}
                    className="rounded-xl text-xs"
                  >
                    {disc} ج.م ({pts} نقطة)
                  </Button>
                );
              })}
            </div>
            {loyaltyDiscount > 0 && (
              <p className="text-xs text-success mt-1.5">🎁 سيتم خصم {loyaltyDiscount} ج.م من نقاطك</p>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="bg-card rounded-2xl p-4 shadow-card mt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">المجموع الفرعي</span>
            <span className="tabular-nums font-semibold">{total} ج.م</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              رسوم التوصيل
              {feeLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              {dynamicFee !== null && <Zap className="h-3 w-3 text-warning" />}
            </span>
            <span className="tabular-nums font-semibold">{deliveryFee} ج.م</span>
          </div>
          {feeDetails && (
            <div className="bg-accent/50 rounded-xl p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-accent-foreground">
                <MapPin className="h-3 w-3" />
                <span>المسافة: {feeDetails.distance_km} كم</span>
              </div>
              {feeDetails.is_peak && (
                <div className="flex items-center gap-1.5 text-[11px] text-warning">
                  <Clock className="h-3 w-3" />
                  <span>وقت ذروة (+30%)</span>
                </div>
              )}
              {feeDetails.demand_level !== "low" && (
                <div className="flex items-center gap-1.5 text-[11px] text-destructive">
                  <TrendingUp className="h-3 w-3" />
                  <span>طلب {feeDetails.demand_level === "high" ? "مرتفع (+25%)" : "متوسط (+10%)"}</span>
                </div>
              )}
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-success">الخصم</span>
              <span className="tabular-nums font-semibold text-success">-{discount} ج.م</span>
            </div>
          )}
          <div className="border-t border-border pt-3 flex justify-between">
            <span className="font-bold">الإجمالي</span>
            <span className="font-bold text-primary tabular-nums">{grandTotal} ج.م</span>
          </div>
        </div>

        <div className="bg-accent rounded-2xl p-4 mt-4 text-center">
          <p className="text-sm text-accent-foreground font-medium">💵 الدفع عند الاستلام</p>
        </div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/80 backdrop-blur">
        <button
          onClick={handleOrder}
          disabled={ordering}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity shadow-card flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {ordering && <Loader2 className="h-5 w-5 animate-spin" />}
          تأكيد الطلب • {grandTotal} ج.م
        </button>
      </div>
    </div>
  );
};

export default CartPage;
