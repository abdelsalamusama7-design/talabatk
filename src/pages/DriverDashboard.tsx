import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LiveDeliveryMap from "@/components/LiveDeliveryMap";
import {
  Truck, MapPin, DollarSign, Package, ArrowRight,
  Navigation, CheckCircle, Clock, Power, PowerOff, Star, Bell,
} from "lucide-react";
import { motion } from "framer-motion";

const DriverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [driver, setDriver] = useState<any>(null);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
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
      // My assigned orders
      const { data: mine } = await supabase
        .from("orders")
        .select("*")
        .eq("driver_id", drv.id)
        .in("status", ["confirmed", "preparing", "ready", "picked_up", "delivering"])
        .order("created_at", { ascending: false });
      setMyOrders(mine || []);

      // Available orders (ready, no driver)
      const { data: available } = await supabase
        .from("orders")
        .select("*")
        .is("driver_id", null)
        .in("status", ["confirmed", "preparing", "ready"])
        .order("created_at", { ascending: false })
        .limit(10);
      setAvailableOrders(available || []);
    } else {
      setShowRegister(true);
    }
    setLoading(false);
  };

  // Realtime for new orders
  useEffect(() => {
    if (!driver) return;
    const channel = supabase
      .channel("driver-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        loadData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [driver]);

  // GPS location tracking
  useEffect(() => {
    if (!driver || driver.status !== "available") return;
    const watchId = navigator.geolocation?.watchPosition(
      async (pos) => {
        await supabase.from("drivers").update({
          current_lat: pos.coords.latitude,
          current_lng: pos.coords.longitude,
        }).eq("id", driver.id);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => { if (watchId !== undefined) navigator.geolocation?.clearWatch(watchId); };
  }, [driver?.id, driver?.status]);

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
    if (newStatus === "available" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await supabase.from("drivers").update({
          current_lat: pos.coords.latitude,
          current_lng: pos.coords.longitude,
        }).eq("id", driver.id);
      });
    }
  };

  const acceptOrder = async (orderId: string) => {
    await supabase.from("orders").update({ driver_id: driver.id, status: "picked_up" }).eq("id", orderId);
    await supabase.from("drivers").update({ status: "busy" }).eq("id", driver.id);
    setDriver({ ...driver, status: "busy" });
    loadData();
    toast({ title: "تم قبول الطلب! 🎉" });
  };

  const updateOrderStatus = async (orderId: string, status: "pending" | "confirmed" | "preparing" | "ready" | "picked_up" | "delivering" | "delivered" | "cancelled") => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    if (status === "delivered") {
      await supabase.from("drivers").update({
        total_deliveries: (driver.total_deliveries || 0) + 1,
        total_earnings: Number(driver.total_earnings || 0) + 15,
        status: "available",
      }).eq("id", driver.id);
      setDriver({ ...driver, status: "available", total_deliveries: (driver.total_deliveries || 0) + 1 });
    }
    loadData();
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

  const activeDeliveries = myOrders.filter((o) => ["picked_up", "delivering"].includes(o.status));
  const completedCount = driver?.total_deliveries || 0;

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <div className="bg-primary pt-10 pb-6 px-4 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">لوحة السائق</h1>
            <p className="text-primary-foreground/70 text-sm">
              {driver?.status === "available" ? "🟢 متاح" : driver?.status === "busy" ? "🟡 مشغول" : "🔴 غير متاح"}
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
            <p className="text-lg font-bold text-foreground">{completedCount}</p>
            <p className="text-[11px] text-muted-foreground">توصيلات</p>
          </div>
          <div className="bg-card rounded-2xl p-3 shadow-card text-center">
            <DollarSign className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{driver?.total_earnings || 0}</p>
            <p className="text-[11px] text-muted-foreground">أرباح ج.م</p>
          </div>
          <div className="bg-card rounded-2xl p-3 shadow-card text-center">
            <Star className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{driver?.rating || 5}</p>
            <p className="text-[11px] text-muted-foreground">التقييم</p>
          </div>
        </div>

        {/* Available orders to accept */}
        {availableOrders.length > 0 && driver?.status === "available" && (
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-warning" /> طلبات متاحة ({availableOrders.length})
            </h3>
            {availableOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-card rounded-2xl p-4 shadow-card mb-3 border-2 border-warning/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">طلب #{order.id.slice(0, 8)}</span>
                  <span className="text-sm font-bold text-primary">{order.total} ج.م</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {(order.items as any[])?.map((i: any) => i.name).join("، ")}
                </p>
                {order.delivery_address && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3" /> {order.delivery_address}
                  </p>
                )}
                <Button size="sm" onClick={() => acceptOrder(order.id)} className="w-full rounded-xl h-10 font-semibold bg-success hover:bg-success/90">
                  <CheckCircle className="h-4 w-4 ml-1" /> قبول الطلب
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Active deliveries with map */}
        {activeDeliveries.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-3">توصيلات نشطة</h3>
            {activeDeliveries.map((order) => (
              <div key={order.id} className="bg-card rounded-2xl shadow-card mb-3 overflow-hidden">
                <LiveDeliveryMap
                  driverName="أنت"
                  orderStatus={order.status}
                  customerLat={order.delivery_lat || undefined}
                  customerLng={order.delivery_lng || undefined}
                  compact
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">طلب #{order.id.slice(0, 8)}</span>
                    <span className="text-sm font-bold text-primary">{order.total} ج.م</span>
                  </div>
                  {order.delivery_address && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                      <MapPin className="h-4 w-4" /> {order.delivery_address}
                    </p>
                  )}
                  {order.notes && (
                    <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 mb-3">📝 {order.notes}</p>
                  )}
                  {order.status === "picked_up" && (
                    <Button size="sm" onClick={() => updateOrderStatus(order.id, "delivering")} className="w-full rounded-xl h-10">
                      <Truck className="h-4 w-4 ml-1" /> بدأت التوصيل
                    </Button>
                  )}
                  {order.status === "delivering" && (
                    <Button size="sm" onClick={() => updateOrderStatus(order.id, "delivered")} className="w-full rounded-xl h-10 bg-success hover:bg-success/90">
                      <CheckCircle className="h-4 w-4 ml-1" /> تم التسليم
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {activeDeliveries.length === 0 && availableOrders.length === 0 && driver?.status === "available" && (
          <div className="text-center py-8">
            <Navigation className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold text-foreground">في انتظار طلبات جديدة...</p>
            <p className="text-sm text-muted-foreground mt-1">سيتم إشعارك عند وصول طلب جديد</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
