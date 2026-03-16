import { useOrders } from "@/lib/order-context";
import { useLiveOrders } from "@/lib/live-order-context";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Truck, Clock, ChefHat, Package, MapPin, X, Eye, Star } from "lucide-react";
import LiveDeliveryMap from "@/components/LiveDeliveryMap";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const allStatusConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "في الانتظار", icon: Clock, color: "text-warning" },
  confirmed: { label: "مؤكد", icon: CheckCircle, color: "text-primary" },
  preparing: { label: "قيد التجهيز", icon: ChefHat, color: "text-warning" },
  ready: { label: "جاهز", icon: Package, color: "text-success" },
  picked_up: { label: "تم الاستلام", icon: Truck, color: "text-primary" },
  delivering: { label: "قيد التوصيل", icon: Truck, color: "text-primary" },
  delivered: { label: "تم التسليم", icon: CheckCircle, color: "text-success" },
  cancelled: { label: "ملغي", icon: X, color: "text-destructive" },
};

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orders: localOrders } = useOrders();
  const { liveOrders } = useLiveOrders();

  // Use DB orders when available; otherwise always fall back to local sample orders
  const sourceOrders = user && liveOrders.length > 0 ? liveOrders : localOrders;

  const activeOrders = sourceOrders.filter((o: any) => !["delivered", "cancelled"].includes(o.status));
  const pastOrders = sourceOrders.filter((o: any) => ["delivered", "cancelled"].includes(o.status));
  const orders = sourceOrders;

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <div className="pt-12 px-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">طلباتك</h1>

        {/* Active orders */}
        {activeOrders.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              طلبات نشطة ({activeOrders.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeOrders.map((order: any) => {
                const config = allStatusConfig[order.status] || allStatusConfig.pending;
                const StatusIcon = config.icon;
                const isLive = "customer_id" in order; // DB order vs local
                const items = isLive
                  ? (Array.isArray(order.items) ? order.items : [])
                  : order.items;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-card rounded-2xl shadow-card overflow-hidden"
                  >
                    {/* Status header */}
                    <div className="bg-primary/5 px-4 py-2.5 flex items-center justify-between">
                      <span className={`flex items-center gap-1.5 text-sm font-semibold ${config.color}`}>
                        <StatusIcon className="h-4 w-4" />
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        #{order.id.slice(0, 8)}
                      </span>
                    </div>

                    <div className="p-4">
                      {/* Items summary */}
                      <div className="mb-3">
                        {items.slice(0, 3).map((item: any, i: number) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            {item.quantity || 1}x {item.name}
                          </p>
                        ))}
                        {items.length > 3 && (
                          <p className="text-xs text-muted-foreground">+{items.length - 3} أخرى</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-foreground tabular-nums">{order.total} ج.م</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(isLive ? order.created_at : Date.now()).toLocaleTimeString("ar-EG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Map for delivering orders */}
                      {["delivering", "picked_up"].includes(order.status) && (
                        <div className="mb-3">
                          <LiveDeliveryMap
                            driverName={isLive ? "أحمد" : order.deliveryPerson}
                            orderStatus={order.status}
                            driverId={isLive ? order.driver_id : undefined}
                            compact
                          />
                        </div>
                      )}

                      {/* Details button */}
                      <Button
                        onClick={() => navigate(isLive ? `/order/${order.id}` : `/track/${order.id}`)}
                        className="w-full rounded-xl h-10 font-semibold"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 ml-1" />
                        {isLive ? "عرض التفاصيل" : "تتبع الطلب"}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Past orders */}
        {pastOrders.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">
              طلبات سابقة ({pastOrders.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pastOrders.map((order: any) => {
                const config = allStatusConfig[order.status] || allStatusConfig.delivered;
                const StatusIcon = config.icon;
                const isLive = "customer_id" in order;
                const items = isLive ? (Array.isArray(order.items) ? order.items : []) : order.items;

                return (
                  <div key={order.id} className="bg-card rounded-2xl p-4 shadow-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`flex items-center gap-1.5 text-sm font-medium ${config.color}`}>
                        <StatusIcon className="h-4 w-4" />
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {isLive
                          ? new Date(order.created_at).toLocaleDateString("ar-EG")
                          : order.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {!isLive && order.storeImage && (
                        <img src={order.storeImage} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      )}
                      <div className="flex-1">
                        {!isLive && <p className="font-semibold text-foreground text-sm">{order.storeName}</p>}
                        <p className="text-xs text-muted-foreground">
                          {items.map((i: any) => i.name).join("، ")}
                        </p>
                      </div>
                      <span className="font-bold text-foreground tabular-nums text-sm">{order.total} ج.م</span>
                    </div>
                    {isLive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/order/${order.id}`)}
                        className="w-full rounded-xl h-9 mt-2 text-xs font-semibold"
                      >
                        <Eye className="h-3.5 w-3.5 ml-1" /> عرض التفاصيل
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-semibold text-foreground mb-1">لا توجد طلبات</p>
            <p className="text-sm text-muted-foreground mb-4">ابدأ بطلب وجبتك المفضلة الآن</p>
            <Button onClick={() => navigate("/")} className="rounded-xl">
              تصفح المطاعم
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
