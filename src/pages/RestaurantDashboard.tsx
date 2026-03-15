import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Store, Plus, Package, ShoppingCart, BarChart3, ArrowRight,
  Clock, CheckCircle, Truck, X, Edit, Trash2, TrendingUp, DollarSign,
} from "lucide-react";

type Tab = "overview" | "menu" | "orders";

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("overview");
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", price: "", description: "", category: "عام" });
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState({ name: "", description: "", category: "restaurants", phone: "", address: "" });

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    const { data: rest } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_id", user!.id)
      .maybeSingle();

    if (rest) {
      setRestaurant(rest);
      const { data: items } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", rest.id)
        .order("created_at", { ascending: false });
      setMenuItems(items || []);

      const { data: ords } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", rest.id)
        .order("created_at", { ascending: false });
      setOrders(ords || []);
    } else {
      setShowRegister(true);
    }
    setLoading(false);
  };

  const registerRestaurant = async () => {
    if (!regForm.name.trim()) return;
    const { error } = await supabase.from("restaurants").insert({
      owner_id: user!.id,
      name: regForm.name,
      description: regForm.description,
      category: regForm.category,
      phone: regForm.phone,
      address: regForm.address,
    });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      // Add restaurant_owner role
      await supabase.from("user_roles").insert({ user_id: user!.id, role: "restaurant_owner" as any });
      toast({ title: "تم تسجيل المطعم بنجاح!", description: "في انتظار الموافقة من الإدارة" });
      setShowRegister(false);
      loadData();
    }
  };

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price) return;
    const { error } = await supabase.from("menu_items").insert({
      restaurant_id: restaurant.id,
      name: newItem.name,
      price: parseFloat(newItem.price),
      description: newItem.description,
      category: newItem.category,
    });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تمت إضافة المنتج" });
      setNewItem({ name: "", price: "", description: "", category: "عام" });
      setShowAddItem(false);
      loadData();
    }
  };

  const deleteMenuItem = async (id: string) => {
    await supabase.from("menu_items").delete().eq("id", id);
    setMenuItems(menuItems.filter((i) => i.id !== id));
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Registration form
  if (showRegister) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="bg-primary pt-10 pb-6 px-4 rounded-b-[2rem]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-primary-foreground">تسجيل مطعم جديد</h1>
            <button onClick={() => navigate("/")} className="bg-card/20 rounded-full p-2">
              <ArrowRight className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>
        </div>
        <div className="px-4 py-6 space-y-4">
          <Input placeholder="اسم المطعم *" value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} className="h-12 rounded-xl" maxLength={100} />
          <Input placeholder="الوصف" value={regForm.description} onChange={(e) => setRegForm({ ...regForm, description: e.target.value })} className="h-12 rounded-xl" maxLength={500} />
          <select
            value={regForm.category}
            onChange={(e) => setRegForm({ ...regForm, category: e.target.value })}
            className="w-full h-12 rounded-xl border border-input bg-background px-3 text-foreground"
          >
            <option value="restaurants">مطاعم</option>
            <option value="pharmacy">صيدليات</option>
            <option value="grocery">بقالة</option>
            <option value="sweets">حلويات</option>
            <option value="vegetables">خضار</option>
            <option value="fruits">فواكه</option>
          </select>
          <Input placeholder="رقم الهاتف" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} className="h-12 rounded-xl" maxLength={20} />
          <Input placeholder="العنوان" value={regForm.address} onChange={(e) => setRegForm({ ...regForm, address: e.target.value })} className="h-12 rounded-xl" maxLength={200} />
          <Button onClick={registerRestaurant} className="w-full h-12 rounded-xl text-base font-semibold">
            <Store className="h-5 w-5 ml-2" /> تسجيل المطعم
          </Button>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;

  const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
    { id: "overview", label: "نظرة عامة", icon: BarChart3 },
    { id: "menu", label: "القائمة", icon: Package },
    { id: "orders", label: "الطلبات", icon: ShoppingCart },
  ];

  const statusLabels: Record<string, { label: string; icon: any; color: string }> = {
    pending: { label: "في الانتظار", icon: Clock, color: "text-warning bg-warning/10" },
    confirmed: { label: "مؤكد", icon: CheckCircle, color: "text-primary bg-accent" },
    preparing: { label: "قيد التجهيز", icon: Clock, color: "text-warning bg-warning/10" },
    ready: { label: "جاهز", icon: CheckCircle, color: "text-success bg-success/10" },
    delivering: { label: "قيد التوصيل", icon: Truck, color: "text-primary bg-accent" },
    delivered: { label: "تم التسليم", icon: CheckCircle, color: "text-success bg-success/10" },
    cancelled: { label: "ملغي", icon: X, color: "text-destructive bg-destructive/10" },
  };

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <div className="bg-primary pt-10 pb-6 px-4 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">{restaurant?.name}</h1>
            <p className="text-primary-foreground/70 text-sm">
              {restaurant?.status === "approved" ? "✅ مفعّل" : "⏳ في انتظار الموافقة"}
            </p>
          </div>
          <button onClick={() => navigate("/")} className="bg-card/20 rounded-full p-2">
            <ArrowRight className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.id ? "bg-card text-primary shadow-card" : "bg-card/20 text-primary-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6">
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<ShoppingCart className="h-5 w-5 text-primary" />} label="إجمالي الطلبات" value={`${orders.length}`} />
              <StatCard icon={<DollarSign className="h-5 w-5 text-success" />} label="إجمالي المبيعات" value={`${totalRevenue.toFixed(0)} ج.م`} />
              <StatCard icon={<TrendingUp className="h-5 w-5 text-warning" />} label="طلبات نشطة" value={`${activeOrders}`} />
              <StatCard icon={<Package className="h-5 w-5 text-primary" />} label="عناصر القائمة" value={`${menuItems.length}`} />
            </div>
          </div>
        )}

        {tab === "menu" && (
          <div className="space-y-4">
            <Button onClick={() => setShowAddItem(true)} className="w-full h-12 rounded-xl font-semibold">
              <Plus className="h-5 w-5 ml-2" /> إضافة منتج جديد
            </Button>

            {showAddItem && (
              <div className="bg-card rounded-2xl p-4 shadow-card space-y-3">
                <Input placeholder="اسم المنتج *" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="h-11 rounded-xl" maxLength={100} />
                <Input placeholder="السعر *" type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className="h-11 rounded-xl" />
                <Input placeholder="الوصف" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="h-11 rounded-xl" maxLength={500} />
                <div className="flex gap-2">
                  <Button onClick={addMenuItem} className="flex-1 h-11 rounded-xl">إضافة</Button>
                  <Button variant="outline" onClick={() => setShowAddItem(false)} className="h-11 rounded-xl">إلغاء</Button>
                </div>
              </div>
            )}

            {menuItems.map((item) => (
              <div key={item.id} className="bg-card rounded-2xl p-4 shadow-card flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-sm font-bold text-primary mt-1">{item.price} ج.م</p>
                </div>
                <button onClick={() => deleteMenuItem(item.id)} className="h-8 w-8 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            {menuItems.length === 0 && !showAddItem && (
              <p className="text-center text-muted-foreground py-8">لا توجد منتجات بعد</p>
            )}
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-3">
            {orders.map((order) => {
              const config = statusLabels[order.status] || statusLabels.pending;
              const Icon = config.icon;
              return (
                <div key={order.id} className="bg-card rounded-2xl p-4 shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">طلب #{order.id.slice(0, 8)}</span>
                    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full font-medium ${config.color}`}>
                      <Icon className="h-3 w-3" /> {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {(order.items as any[])?.map((i: any) => i.name).join("، ") || "—"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{order.total} ج.م</span>
                    {order.status === "pending" && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, "confirmed")} className="rounded-xl text-xs h-8">
                        تأكيد الطلب
                      </Button>
                    )}
                    {order.status === "confirmed" && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, "preparing")} className="rounded-xl text-xs h-8">
                        بدء التجهيز
                      </Button>
                    )}
                    {order.status === "preparing" && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, "ready")} className="rounded-xl text-xs h-8">
                        جاهز للتوصيل
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {orders.length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد طلبات</p>}
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

export default RestaurantDashboard;
