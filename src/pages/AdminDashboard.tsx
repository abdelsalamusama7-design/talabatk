import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3, Package, ShoppingCart, Users, ArrowRight, Truck,
  CheckCircle, Clock, X, Store, DollarSign, Shield, TrendingUp,
  Eye, UserCheck, UserX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Tab = "stats" | "restaurants" | "orders" | "drivers" | "users";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("stats");
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [r, o, d, p] = await Promise.all([
      supabase.from("restaurants").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("drivers").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);
    setRestaurants(r.data || []);
    setOrders(o.data || []);
    setDrivers(d.data || []);
    setProfiles(p.data || []);
    setLoading(false);
  };

  const updateRestaurantStatus = async (id: string, status: string) => {
    await supabase.from("restaurants").update({ status }).eq("id", id);
    setRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(status === "approved" ? "تم تفعيل المطعم" : "تم تعليق المطعم");
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status || "")).length;
  const availableDrivers = drivers.filter((d) => d.status === "available").length;

  const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
    pending: { label: "في الانتظار", icon: Clock, color: "text-warning bg-warning/10" },
    confirmed: { label: "مؤكد", icon: CheckCircle, color: "text-primary bg-accent" },
    preparing: { label: "قيد التجهيز", icon: Clock, color: "text-warning bg-warning/10" },
    ready: { label: "جاهز", icon: Package, color: "text-success bg-success/10" },
    picked_up: { label: "تم الاستلام", icon: Truck, color: "text-primary bg-accent" },
    delivering: { label: "قيد التوصيل", icon: Truck, color: "text-primary bg-accent" },
    delivered: { label: "تم التسليم", icon: CheckCircle, color: "text-success bg-success/10" },
    cancelled: { label: "ملغي", icon: X, color: "text-destructive bg-destructive/10" },
  };

  const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
    { id: "stats", label: "إحصائيات", icon: BarChart3 },
    { id: "restaurants", label: "المطاعم", icon: Store },
    { id: "orders", label: "الطلبات", icon: ShoppingCart },
    { id: "drivers", label: "المناديب", icon: Truck },
    { id: "users", label: "المستخدمين", icon: Users },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <div className="bg-primary pt-10 pb-6 px-4 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-primary-foreground">
            <Shield className="h-5 w-5 inline ml-1" /> لوحة التحكم
          </h1>
          <button onClick={() => navigate("/")} className="bg-card/20 rounded-full p-2">
            <ArrowRight className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                tab === t.id ? "bg-card text-primary shadow-card" : "bg-card/20 text-primary-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6">
        {tab === "stats" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<ShoppingCart className="h-5 w-5 text-primary" />} label="إجمالي الطلبات" value={`${orders.length}`} />
              <StatCard icon={<DollarSign className="h-5 w-5 text-success" />} label="إجمالي الإيرادات" value={`${totalRevenue.toFixed(0)} ج.م`} />
              <StatCard icon={<TrendingUp className="h-5 w-5 text-warning" />} label="طلبات نشطة" value={`${activeOrders}`} />
              <StatCard icon={<Truck className="h-5 w-5 text-primary" />} label="مناديب متاحين" value={`${availableDrivers}`} />
              <StatCard icon={<Store className="h-5 w-5 text-success" />} label="المطاعم" value={`${restaurants.length}`} />
              <StatCard icon={<Users className="h-5 w-5 text-primary" />} label="المستخدمين" value={`${profiles.length}`} />
            </div>
          </div>
        )}

        {tab === "restaurants" && (
          <div className="space-y-3">
            {restaurants.map((r) => (
              <div key={r.id} className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{r.name}</h3>
                    <p className="text-xs text-muted-foreground">{r.category} • {r.address || "—"}</p>
                  </div>
                  <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                    r.status === "approved" ? "bg-success/10 text-success" :
                    r.status === "pending" ? "bg-warning/10 text-warning" :
                    "bg-destructive/10 text-destructive"
                  }`}>
                    {r.status === "approved" ? "مفعّل" : r.status === "pending" ? "في الانتظار" : r.status}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  {r.status !== "approved" && (
                    <Button size="sm" onClick={() => updateRestaurantStatus(r.id, "approved")} className="rounded-xl text-xs h-8 flex-1">
                      <UserCheck className="h-3 w-3 ml-1" /> تفعيل
                    </Button>
                  )}
                  {r.status === "approved" && (
                    <Button size="sm" variant="outline" onClick={() => updateRestaurantStatus(r.id, "suspended")} className="rounded-xl text-xs h-8 flex-1 text-destructive border-destructive/30">
                      <UserX className="h-3 w-3 ml-1" /> تعليق
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {restaurants.length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد مطاعم</p>}
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-3">
            {orders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const Icon = config.icon;
              return (
                <div key={order.id} className="bg-card rounded-2xl p-4 shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground font-mono">#{order.id.slice(0, 8)}</span>
                    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full font-medium ${config.color}`}>
                      <Icon className="h-3 w-3" /> {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {(order.items as any[])?.map((i: any) => i.name).join("، ") || "—"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground tabular-nums">{order.total} ج.م</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                  {order.status === "pending" && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, "confirmed")} className="rounded-xl text-xs h-8 flex-1">تأكيد</Button>
                      <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "cancelled")} className="rounded-xl text-xs h-8 text-destructive border-destructive/30">إلغاء</Button>
                    </div>
                  )}
                </div>
              );
            })}
            {orders.length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد طلبات</p>}
          </div>
        )}

        {tab === "drivers" && (
          <div className="space-y-3">
            {drivers.map((d) => (
              <div key={d.id} className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-sm">سائق #{d.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.vehicle_type === "motorcycle" ? "دراجة نارية" : d.vehicle_type === "car" ? "سيارة" : "دراجة"} •
                      ⭐ {d.rating || 5} • {d.total_deliveries || 0} توصيلة
                    </p>
                  </div>
                  <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                    d.status === "available" ? "bg-success/10 text-success" :
                    d.status === "busy" ? "bg-warning/10 text-warning" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {d.status === "available" ? "متاح" : d.status === "busy" ? "مشغول" : "غير متصل"}
                  </span>
                </div>
              </div>
            ))}
            {drivers.length === 0 && <p className="text-center text-muted-foreground py-8">لا يوجد مناديب</p>}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-3">
            {profiles.map((p) => (
              <div key={p.id} className="bg-card rounded-2xl p-4 shadow-card flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground text-sm">{p.full_name || "بدون اسم"}</p>
                  <p className="text-xs text-muted-foreground">{p.phone || "—"} • {p.default_address || "—"}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(p.created_at).toLocaleDateString("ar-EG")}
                </span>
              </div>
            ))}
            {profiles.length === 0 && <p className="text-center text-muted-foreground py-8">لا يوجد مستخدمين</p>}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-card rounded-2xl p-4 shadow-card">
    <div className="mb-2">{icon}</div>
    <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
  </div>
);

export default AdminDashboard;
