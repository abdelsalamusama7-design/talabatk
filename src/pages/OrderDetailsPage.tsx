import { useParams, useNavigate } from "react-router-dom";
import { useLiveOrders } from "@/lib/live-order-context";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import OrderProgressStepper from "@/components/OrderProgressStepper";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowRight,
  RefreshCw,
  MapPin,
  Clock,
  Receipt,
  ShoppingBag,
  Copy,
  MessageCircle,
  Star,
  XCircle,
  Phone,
  Timer,
  Navigation,
} from "lucide-react";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface DriverInfo {
  id: string;
  name: string | null;
  phone: string | null;
  rating: number | null;
  vehicle_type: string | null;
  total_deliveries: number | null;
}

const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { liveOrders } = useLiveOrders();
  const { addItem } = useCart();
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [reordering, setReordering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [driver, setDriver] = useState<DriverInfo | null>(null);
  const order = liveOrders.find((o) => o.id === id);

  // Fetch restaurant name
  useEffect(() => {
    if (!order) return;
    supabase
      .from("restaurants")
      .select("name")
      .eq("id", order.restaurant_id)
      .single()
      .then(({ data }) => {
        if (data) setRestaurantName(data.name);
      });
  }, [order?.restaurant_id]);

  // Fetch driver info
  useEffect(() => {
    if (!order?.driver_id) {
      setDriver(null);
      return;
    }
    supabase
      .from("drivers")
      .select("id, name, phone, rating, vehicle_type, total_deliveries")
      .eq("id", order.driver_id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setDriver(data as DriverInfo);
      });
  }, [order?.driver_id]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">يرجى تسجيل الدخول لعرض تفاصيل الطلب</p>
          <Button onClick={() => navigate("/auth")}>تسجيل الدخول</Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-semibold text-foreground mb-1">الطلب غير موجود</p>
          <Button onClick={() => navigate("/orders")} className="mt-4 rounded-xl">
            العودة للطلبات
          </Button>
        </div>
      </div>
    );
  }

  const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
  const isActive = !["delivered", "cancelled"].includes(order.status);
  const canCancel = ["pending", "confirmed"].includes(order.status);
  const orderDate = new Date(order.created_at);

  // Calculate ETA
  const getEta = () => {
    if (order.estimated_delivery) {
      const etaDate = new Date(order.estimated_delivery);
      const now = new Date();
      const diffMin = Math.max(0, Math.round((etaDate.getTime() - now.getTime()) / 60000));
      if (diffMin <= 0) return "وصل تقريباً";
      return `${diffMin} دقيقة`;
    }
    switch (order.status) {
      case "pending": return "30-45 دقيقة";
      case "confirmed": return "25-40 دقيقة";
      case "preparing": return "20-30 دقيقة";
      case "ready": return "15-25 دقيقة";
      case "picked_up": return "10-20 دقيقة";
      case "delivering": return "5-15 دقيقة";
      default: return "";
    }
  };

  const eta = getEta();

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", order.id);
      if (error) throw error;
      toast.success("تم إلغاء الطلب بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء إلغاء الطلب");
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async () => {
    setReordering(true);
    try {
      const { data: menuItems } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", order.restaurant_id)
        .eq("is_available", true);

      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", order.restaurant_id)
        .single();

      if (!restaurant) {
        toast.error("المطعم غير متاح حالياً");
        setReordering(false);
        return;
      }

      let addedCount = 0;
      for (const item of items) {
        const menuItem = menuItems?.find(
          (m) => m.name === item.name || m.id === (item as any).id
        );

        const product = {
          id: menuItem?.id || crypto.randomUUID(),
          name: item.name,
          price: menuItem?.price || item.price,
          description: menuItem?.description || "",
          image: menuItem?.image_url || item.image || "",
        };

        const store = {
          id: restaurant.id,
          name: restaurant.name,
          category: restaurant.category,
          categoryId: restaurant.category,
          image: restaurant.image_url || "",
          rating: restaurant.rating || 0,
          reviewCount: restaurant.review_count || 0,
          deliveryTime: restaurant.delivery_time || "30-45 دقيقة",
          deliveryFee: restaurant.delivery_fee || 0,
          products: [],
        };

        for (let i = 0; i < (item.quantity || 1); i++) {
          addItem(product, store);
          addedCount++;
        }
      }

      toast.success(`تمت إضافة ${addedCount} عنصر إلى السلة`, {
        action: { label: "عرض السلة", onClick: () => navigate("/cart") },
      });
      navigate("/cart");
    } catch {
      toast.error("حدث خطأ أثناء إعادة الطلب");
    } finally {
      setReordering(false);
    }
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    toast.success("تم نسخ رقم الطلب");
  };

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/orders")}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowRight className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">تفاصيل الطلب</h1>
            <p className="text-xs text-muted-foreground">#{order.id.slice(0, 8)}</p>
          </div>
          <button onClick={copyOrderId} className="text-muted-foreground">
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Restaurant info */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-card rounded-2xl p-4 shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">{restaurantName || "المطعم"}</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <Clock className="h-3 w-3" />
                <span>{orderDate.toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                <span>•</span>
                <span>{orderDate.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ETA card for active orders */}
        {isActive && eta && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.03 }}
            className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Timer className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">الوقت المتوقع للتوصيل</p>
              <p className="text-lg font-bold text-primary">{eta}</p>
            </div>
            {isActive && (
              <motion.div
                className="w-3 h-3 rounded-full bg-success"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
          </motion.div>
        )}

        {/* Driver info card */}
        {isActive && driver && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-2xl p-4 shadow-card"
          >
            <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
              🏍️ المندوب المسؤول
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                🏍️
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">{driver.name || "المندوب"}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <Star className="h-3 w-3 text-warning fill-warning" />
                  <span>{driver.rating?.toFixed(1) || "5.0"}</span>
                  <span className="mx-0.5">•</span>
                  <span>{driver.vehicle_type === "motorcycle" ? "موتوسيكل" : driver.vehicle_type || "موتوسيكل"}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              {driver.phone ? (
                <a
                  href={`tel:${driver.phone}`}
                  className="flex-1 h-11 rounded-xl bg-success/10 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <Phone className="h-4 w-4 text-success" />
                  <span className="text-sm font-semibold text-success">اتصال</span>
                </a>
              ) : (
                <button
                  disabled
                  className="flex-1 h-11 rounded-xl bg-muted flex items-center justify-center gap-2 opacity-50"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-muted-foreground">اتصال</span>
                </button>
              )}

              <button
                onClick={() => navigate(`/track/${order.id}`)}
                className="flex-1 h-11 rounded-xl bg-primary/10 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <MessageCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">محادثة وتتبع</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Waiting for driver */}
        {isActive && !driver && ["confirmed", "preparing", "ready"].includes(order.status) && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-2xl p-4 shadow-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Navigation className="h-5 w-5 text-muted-foreground animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">جاري تعيين مندوب...</p>
                <p className="text-xs text-muted-foreground mt-0.5">سيتم إعلامك فور تعيين المندوب</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Order progress */}
        {isActive && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 }}>
            <OrderProgressStepper orderStatus={order.status} createdAt={order.created_at} />
          </motion.div>
        )}

        {/* Items */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 shadow-card"
        >
          <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            عناصر الطلب ({items.length})
          </h3>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">x{item.quantity || 1}</p>
                </div>
                <span className="font-semibold text-foreground text-sm tabular-nums">
                  {((item.price || 0) * (item.quantity || 1)).toFixed(0)} ج.م
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-border mt-4 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>المجموع الفرعي</span>
              <span>{order.subtotal} ج.م</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>رسوم التوصيل</span>
              <span>{order.delivery_fee} ج.م</span>
            </div>
            <div className="flex justify-between font-bold text-foreground text-base pt-1">
              <span>الإجمالي</span>
              <span>{order.total} ج.م</span>
            </div>
          </div>
        </motion.div>

        {/* Delivery address */}
        {order.delivery_address && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-2xl p-4 shadow-card"
          >
            <h3 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              عنوان التوصيل
            </h3>
            <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
          </motion.div>
        )}

        {/* Notes */}
        {order.notes && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-4 shadow-card"
          >
            <h3 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              ملاحظات
            </h3>
            <p className="text-sm text-muted-foreground">{order.notes}</p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          {/* Track button for active */}
          {isActive && (
            <Button
              onClick={() => navigate(`/track/${order.id}`)}
              className="w-full rounded-2xl h-12 font-bold text-base gap-2"
            >
              <MapPin className="h-5 w-5" />
              تتبع الطلب مباشرة
            </Button>
          )}

          {/* Reorder button */}
          <Button
            onClick={handleReorder}
            disabled={reordering}
            variant={isActive ? "outline" : "default"}
            className="w-full rounded-2xl h-12 font-bold text-base gap-2"
          >
            <RefreshCw className={`h-5 w-5 ${reordering ? "animate-spin" : ""}`} />
            {reordering ? "جاري إعادة الطلب..." : "إعادة الطلب بنقرة واحدة"}
          </Button>

          {/* Cancel button for pending/confirmed */}
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full rounded-2xl h-11 font-semibold gap-2 border-destructive text-destructive hover:bg-destructive/10"
                  disabled={cancelling}
                >
                  <XCircle className="h-4 w-4" />
                  {cancelling ? "جاري الإلغاء..." : "إلغاء الطلب"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد من إلغاء الطلب؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    لا يمكن التراجع عن هذا الإجراء بعد تأكيده.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row-reverse gap-2">
                  <AlertDialogCancel>تراجع</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    تأكيد الإلغاء
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Rate delivered order */}
          {order.status === "delivered" && (
            <Button
              onClick={() => navigate(`/store/${order.restaurant_id}`)}
              variant="outline"
              className="w-full rounded-2xl h-11 font-semibold gap-2"
            >
              <Star className="h-4 w-4 text-warning" />
              قيّم الطلب
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
