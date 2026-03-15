import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Truck, MapPin, DollarSign, Package, ArrowRight,
  Navigation, CheckCircle, Clock, Power, PowerOff,
} from "lucide-react";

const DriverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [driver, setDriver] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState({ vehicle_type: "motorcycle", license_number: "" });

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    const { data: drv } = await supabase
      .from("drivers")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (drv) {
      setDriver(drv);
      const { data: ords } = await supabase
        .from("orders")
        .select("*, restaurants(name, image_url)")
        .eq("driver_id", drv.id)
        .order("created_at", { ascending: false });
      setOrders(ords || []);
    } else {
      setShowRegister(true);
    }
    setLoading(false);
  };

  const registerDriver = async () => {
    const { error } = await supabase.from("drivers").insert({
      user_id: user!.id,
      vehicle_type: regForm.vehicle_type,
      license_number: regForm.license_number,
    });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      await supabase.from("user_roles").insert({ user_id: user!.id, role: "driver" as any });
      toast({ title: "تم تسجيلك كسائق!" });
      setShowRegister(false);
      loadData();
    }
  };

  const toggleStatus = async () => {
    const newStatus = driver.status === "available" ? "offline" : "available";
    await supabase.from("drivers").update({ status: newStatus }).eq("id", driver.id);
    setDriver({ ...driver, status: newStatus });

    // Update location when going online
    if (newStatus === "available" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await supabase.from("drivers").update({
          current_lat: pos.coords.latitude,
          current_lng: pos.coords.longitude,
        }).eq("id", driver.id);
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: "pending" | "confirmed" | "preparing" | "ready" | "picked_up" | "delivering" | "delivered" | "cancelled") => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
    if (status === "delivered") {
      await supabase.from("drivers").update({
        total_deliveries: (driver.total_deliveries || 0) + 1,
      }).eq("id", driver.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showRegister) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="bg-primary pt-10 pb-6 px-4 rounded-b-[2rem]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-primary-foreground">التسجيل كسائق</h1>
            <button onClick={() => navigate("/")} className="bg-card/20 rounded-full p-2">
              <ArrowRight className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>
        </div>
        <div className="px-4 py-6 space-y-4">
          <select
            value={regForm.vehicle_type}
            onChange={(e) => setRegForm({ ...regForm, vehicle_type: e.target.value })}
            className="w-full h-12 rounded-xl border border-input bg-background px-3 text-foreground"
          >
            <option value="motorcycle">دراجة نارية</option>
            <option value="car">سيارة</option>
            <option value="bicycle">دراجة هوائية</option>
          </select>
          <Input placeholder="رقم الرخصة" value={regForm.license_number} onChange={(e) => setRegForm({ ...regForm, license_number: e.target.value })} className="h-12 rounded-xl" maxLength={50} />
          <Button onClick={registerDriver} className="w-full h-12 rounded-xl text-base font-semibold">
            <Truck className="h-5 w-5 ml-2" /> تسجيل كسائق
          </Button>
        </div>
      </div>
    );
  }

  const activeDeliveries = orders.filter((o) => ["picked_up", "delivering"].includes(o.status));
  const completedDeliveries = orders.filter((o) => o.status === "delivered");

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <div className="bg-primary pt-10 pb-6 px-4 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">لوحة السائق</h1>
            <p className="text-primary-foreground/70 text-sm">
              {driver?.status === "available" ? "🟢 متاح" : "🔴 غير متاح"}
            </p>
          </div>
          <button onClick={() => navigate("/")} className="bg-card/20 rounded-full p-2">
            <ArrowRight className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>

        <Button
          onClick={toggleStatus}
          className={`w-full h-12 rounded-xl font-semibold ${
            driver?.status === "available"
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "bg-card text-success hover:bg-card/90"
          }`}
        >
          {driver?.status === "available" ? (
            <><PowerOff className="h-5 w-5 ml-2" /> إيقاف الاستقبال</>
          ) : (
            <><Power className="h-5 w-5 ml-2" /> بدء الاستقبال</>
          )}
        </Button>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-3 shadow-card text-center">
            <Package className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{driver?.total_deliveries || 0}</p>
            <p className="text-[11px] text-muted-foreground">توصيلات</p>
          </div>
          <div className="bg-card rounded-2xl p-3 shadow-card text-center">
            <DollarSign className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{driver?.total_earnings || 0}</p>
            <p className="text-[11px] text-muted-foreground">أرباح ج.م</p>
          </div>
          <div className="bg-card rounded-2xl p-3 shadow-card text-center">
            <Navigation className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{activeDeliveries.length}</p>
            <p className="text-[11px] text-muted-foreground">نشطة</p>
          </div>
        </div>

        {/* Active deliveries */}
        {activeDeliveries.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-3">توصيلات نشطة</h3>
            {activeDeliveries.map((order) => (
              <div key={order.id} className="bg-card rounded-2xl p-4 shadow-card mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">طلب #{order.id.slice(0, 8)}</span>
                  <span className="text-sm font-bold text-primary">{order.total} ج.م</span>
                </div>
                {order.delivery_address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="h-4 w-4" /> {order.delivery_address}
                  </p>
                )}
                {order.status === "picked_up" && (
                  <Button size="sm" onClick={() => updateOrderStatus(order.id, "delivering")} className="w-full rounded-xl h-9">
                    <Truck className="h-4 w-4 ml-1" /> بدأت التوصيل
                  </Button>
                )}
                {order.status === "delivering" && (
                  <Button size="sm" onClick={() => updateOrderStatus(order.id, "delivered")} className="w-full rounded-xl h-9 bg-success hover:bg-success/90">
                    <CheckCircle className="h-4 w-4 ml-1" /> تم التسليم
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* History */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">سجل التوصيلات ({completedDeliveries.length})</h3>
          {completedDeliveries.slice(0, 10).map((order) => (
            <div key={order.id} className="bg-card rounded-2xl p-3 shadow-card mb-2 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-foreground">#{order.id.slice(0, 8)}</span>
                <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("ar")}</p>
              </div>
              <span className="text-sm font-bold text-success">{order.total} ج.م</span>
            </div>
          ))}
          {completedDeliveries.length === 0 && (
            <p className="text-center text-muted-foreground py-4">لا توجد توصيلات مكتملة</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
