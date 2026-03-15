import { useState, useEffect } from "react";
import { Bell, X, Package, Tag, Clock, Truck, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { AnimatePresence, motion } from "framer-motion";

interface Notification {
  id: string;
  type: "order" | "offer" | "driver" | "restaurant";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const STATUS_AR: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "تم التأكيد",
  preparing: "جاري التحضير",
  ready: "جاهز للاستلام",
  picked_up: "تم الاستلام",
  delivering: "جاري التوصيل",
  delivered: "تم التوصيل ✅",
  cancelled: "ملغي ❌",
};

const NotificationsPanel = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      const items: Notification[] = [];

      // Load recent orders as notifications
      if (user) {
        const { data: orders } = await supabase
          .from("orders")
          .select("id, status, created_at, updated_at")
          .eq("customer_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(10);

        if (orders) {
          orders.forEach((o) => {
            items.push({
              id: `order-${o.id}`,
              type: "order",
              title: `طلب #${o.id.slice(0, 8)}`,
              message: `حالة الطلب: ${STATUS_AR[o.status || "pending"] || o.status}`,
              time: o.updated_at,
              read: o.status === "delivered" || o.status === "cancelled",
            });
          });
        }
      }

      // Load active offers
      const { data: offers } = await supabase
        .from("offers")
        .select("id, title, subtitle, discount, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);

      if (offers) {
        offers.forEach((o) => {
          items.push({
            id: `offer-${o.id}`,
            type: "offer",
            title: o.title,
            message: `${o.discount}${o.subtitle ? " - " + o.subtitle : ""}`,
            time: o.created_at,
            read: false,
          });
        });
      }

      // Sort by time
      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setNotifications(items);
      setLoading(false);
    };
    load();
  }, [open, user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "الآن";
    if (mins < 60) return `منذ ${mins} د`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `منذ ${hrs} س`;
    const days = Math.floor(hrs / 24);
    return `منذ ${days} يوم`;
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-0 left-0 right-0 max-h-[80vh] bg-card rounded-b-2xl shadow-xl overflow-hidden flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-primary px-4 pt-10 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary-foreground flex items-center gap-2">
            <Bell className="h-5 w-5" />
            الإشعارات
            {unreadCount > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </h2>
          <button onClick={onClose} className="bg-card/20 rounded-full p-2">
            <X className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">لا توجد إشعارات</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-xl border transition-colors ${
                  notif.read
                    ? "bg-muted/30 border-border"
                    : "bg-primary/5 border-primary/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                    notif.type === "order" ? "bg-primary/10" : "bg-warning/10"
                  }`}>
                    {notif.type === "order" ? (
                      <Package className="h-4 w-4 text-primary" />
                    ) : (
                      <Tag className="h-4 w-4 text-warning" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                    <Clock className="h-3 w-3" />
                    {timeAgo(notif.time)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotificationsPanel;
