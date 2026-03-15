import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Package, ShoppingCart, CheckCircle, Clock, Truck, X, Eye,
  MapPin, FileText, User, DollarSign,
} from "lucide-react";

const STATUS_FLOW: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["picked_up"],
  picked_up: ["delivering"],
  delivering: ["delivered"],
  delivered: [],
  cancelled: [],
};

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: "في الانتظار", icon: Clock, color: "text-warning bg-warning/10" },
  confirmed: { label: "مؤكد", icon: CheckCircle, color: "text-primary bg-accent" },
  preparing: { label: "قيد التجهيز", icon: Clock, color: "text-warning bg-warning/10" },
  ready: { label: "جاهز", icon: Package, color: "text-success bg-success/10" },
  picked_up: { label: "تم الاستلام", icon: Truck, color: "text-primary bg-accent" },
  delivering: { label: "قيد التوصيل", icon: Truck, color: "text-primary bg-accent" },
  delivered: { label: "تم التسليم", icon: CheckCircle, color: "text-success bg-success/10" },
  cancelled: { label: "ملغي", icon: X, color: "text-destructive bg-destructive/10" },
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "تأكيد",
  preparing: "بدء التحضير",
  ready: "جاهز",
  picked_up: "تم الاستلام",
  delivering: "بدء التوصيل",
  delivered: "تم التسليم",
  cancelled: "إلغاء",
};

interface Order {
  id: string;
  customer_id: string;
  restaurant_id: string;
  driver_id: string | null;
  status: string | null;
  items: any;
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
}

const AdminOrders = ({ orders: initial, restaurants }: { orders: Order[]; restaurants: any[] }) => {
  const [orders, setOrders] = useState<Order[]>(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status: status as any }).eq("id", id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    toast.success(`تم تحديث الحالة إلى: ${STATUS_CONFIG[status]?.label}`);
  };

  const getRestaurantName = (id: string) => {
    const r = restaurants.find((r: any) => r.id === id);
    return r?.name || "غير معروف";
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const totalRevenue = orders.filter(o => o.status === "delivered").reduce((s, o) => s + Number(o.total || 0), 0);

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-card rounded-xl p-3 shadow-card text-center">
          <p className="text-lg font-bold text-foreground">{orders.length}</p>
          <p className="text-[10px] text-muted-foreground">إجمالي</p>
        </div>
        <div className="bg-card rounded-xl p-3 shadow-card text-center">
          <p className="text-lg font-bold text-success">{totalRevenue.toFixed(0)}</p>
          <p className="text-[10px] text-muted-foreground">إيرادات (ج.م)</p>
        </div>
        <div className="bg-card rounded-xl p-3 shadow-card text-center">
          <p className="text-lg font-bold text-warning">{orders.filter(o => !["delivered", "cancelled"].includes(o.status || "")).length}</p>
          <p className="text-[10px] text-muted-foreground">نشطة</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {["all", "pending", "confirmed", "preparing", "ready", "picked_up", "delivering", "delivered", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
              filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {s === "all" ? `الكل (${orders.length})` : `${STATUS_CONFIG[s]?.label} (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {filtered.map((order) => {
        const config = STATUS_CONFIG[order.status || "pending"] || STATUS_CONFIG.pending;
        const Icon = config.icon;
        const nextStatuses = STATUS_FLOW[order.status || "pending"] || [];
        const items = (order.items as any[]) || [];

        return (
          <div key={order.id} className="bg-card rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-semibold text-foreground font-mono">#{order.id.slice(0, 8)}</span>
                <p className="text-[11px] text-muted-foreground">{getRestaurantName(order.restaurant_id)}</p>
              </div>
              <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full font-medium ${config.color}`}>
                <Icon className="h-3 w-3" /> {config.label}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{items.map((i: any) => `${i.name} x${i.quantity}`).join("، ") || "—"}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground tabular-nums">{order.total} ج.م</span>
              <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("ar-EG")} {new Date(order.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>

            {/* Expanded details */}
            {expandedId === order.id && (
              <div className="bg-muted/30 rounded-xl p-3 mt-2 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-3 w-3" /> العميل: {order.customer_id.slice(0, 8)}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {order.delivery_address || "—"}
                </div>
                {order.driver_id && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Truck className="h-3 w-3" /> المندوب: {order.driver_id.slice(0, 8)}
                  </div>
                )}
                {order.notes && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="h-3 w-3" /> {order.notes}
                  </div>
                )}
                <div className="flex gap-3 text-muted-foreground">
                  <span>فرعي: {order.subtotal} ج.م</span>
                  <span>توصيل: {order.delivery_fee} ج.م</span>
                  <span className="font-bold text-foreground">إجمالي: {order.total} ج.م</span>
                </div>
                {/* Items breakdown */}
                <div className="border-t border-border pt-1.5 mt-1.5">
                  {items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-muted-foreground">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{item.price * item.quantity} ج.م</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-1.5 mt-2 flex-wrap">
              <Button size="sm" variant="ghost" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)} className="rounded-xl text-xs h-8">
                <Eye className="h-3 w-3 ml-1" /> {expandedId === order.id ? "إخفاء" : "تفاصيل"}
              </Button>
              {nextStatuses.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={s === "cancelled" ? "outline" : "default"}
                  onClick={() => updateStatus(order.id, s)}
                  className={`rounded-xl text-xs h-8 ${s === "cancelled" ? "text-destructive border-destructive/30" : ""}`}
                >
                  {STATUS_LABELS[s] || s}
                </Button>
              ))}
            </div>
          </div>
        );
      })}
      {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد طلبات</p>}
    </div>
  );
};

export default AdminOrders;
