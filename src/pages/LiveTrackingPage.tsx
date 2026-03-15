import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLiveOrders } from "@/lib/live-order-context";
import LiveDeliveryMap from "@/components/LiveDeliveryMap";
import OrderProgressStepper from "@/components/OrderProgressStepper";
import OrderChat from "@/components/OrderChat";
import { ArrowRight, Phone, MessageCircle, Star, Clock, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const LiveTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { liveOrders } = useLiveOrders();
  const [chatOpen, setChatOpen] = useState(false);
  const order = liveOrders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4" dir="rtl">
        <p className="text-lg font-semibold text-foreground mb-4">الطلب غير موجود</p>
        <Button onClick={() => navigate("/orders")} className="rounded-xl">
          العودة للطلبات
        </Button>
      </div>
    );
  }

  const isActive = !["delivered", "cancelled"].includes(order.status);
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="min-h-screen bg-background pb-6" dir="rtl">
      {/* Top bar */}
      <div className="bg-primary pt-10 pb-4 px-4 rounded-b-2xl">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => navigate("/orders")} className="bg-card/20 rounded-full p-2">
            <ArrowRight className="h-5 w-5 text-primary-foreground" />
          </button>
          <h1 className="text-lg font-bold text-primary-foreground">تتبع الطلب</h1>
          <div className="w-9" />
        </div>

        {/* Status pill */}
        <motion.div
          className="bg-card/20 rounded-xl px-4 py-2 text-center"
          animate={isActive ? { opacity: [0.7, 1, 0.7] } : {}}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <p className="text-primary-foreground font-semibold text-sm">
            {order.status === "pending" && "⏳ في انتظار التأكيد"}
            {order.status === "confirmed" && "✅ تم تأكيد الطلب"}
            {order.status === "preparing" && "👨‍🍳 جاري تحضير طلبك"}
            {order.status === "ready" && "📦 طلبك جاهز"}
            {order.status === "picked_up" && "🏍️ المندوب استلم الطلب"}
            {order.status === "delivering" && "🚀 المندوب في الطريق إليك"}
            {order.status === "delivered" && "🎉 تم التسليم بنجاح"}
            {order.status === "cancelled" && "❌ تم إلغاء الطلب"}
          </p>
        </motion.div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Live Map */}
        {isActive && (
          <LiveDeliveryMap
            driverName="أحمد"
            orderStatus={order.status}
            driverId={order.driver_id}
            customerLat={order.delivery_lat || undefined}
            customerLng={order.delivery_lng || undefined}
          />
        )}

        {/* Driver info card */}
        {isActive && ["picked_up", "delivering"].includes(order.status) && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-card rounded-2xl p-4 shadow-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                🏍️
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">أحمد محمد</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 text-warning fill-warning" /> 4.8
                  <span className="mx-1">•</span>
                  دراجة نارية
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-success" />
                </button>
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <MessageCircle className="h-4 w-4 text-primary" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Order progress stepper */}
        <OrderProgressStepper orderStatus={order.status} />

        {/* Order details */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="font-semibold text-foreground mb-3 text-sm">تفاصيل الطلب</h3>

          {/* Delivery address */}
          {order.delivery_address && (
            <div className="flex items-start gap-2 mb-3 pb-3 border-b border-border">
              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
            </div>
          )}

          {/* Items */}
          <div className="space-y-2 mb-3">
            {items.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-muted w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-foreground">
                    {item.quantity || 1}
                  </span>
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground tabular-nums">
                  {item.price ? `${item.price} ج.م` : ""}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">المجموع الفرعي</span>
              <span className="tabular-nums">{order.subtotal} ج.م</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">رسوم التوصيل</span>
              <span className="tabular-nums">{order.delivery_fee} ج.م</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>الإجمالي</span>
              <span className="text-primary tabular-nums">{order.total} ج.م</span>
            </div>
          </div>
        </div>

        {/* Order ID + time */}
        <div className="bg-muted/50 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {new Date(order.created_at).toLocaleString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
              day: "numeric",
              month: "short",
            })}
          </div>
          <span className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</span>
        </div>

        {/* Chat panel */}
        <AnimatePresence>
          {chatOpen && isActive && (
            <OrderChat orderId={order.id} onClose={() => setChatOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveTrackingPage;
