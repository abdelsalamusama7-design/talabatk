import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3, ShoppingCart, Users, ArrowRight, Truck,
  Store, DollarSign, Shield, TrendingUp, Percent,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminRestaurants from "@/components/admin/AdminRestaurants";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminDrivers from "@/components/admin/AdminDrivers";
import AdminUsers from "@/components/admin/AdminUsers";
import { AdminCharts } from "@/components/admin/AdminCharts";

// Keep offers imports inline since they were already working
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Save } from "lucide-react";

type Tab = "stats" | "restaurants" | "orders" | "drivers" | "users" | "offers";

interface Offer {
  id: string; title: string; subtitle: string | null; discount: string;
  bg_color: string; icon: string; badge: string | null; is_active: boolean;
  sort_order: number; expires_at: string | null; promo_code_id: string | null;
}

interface PromoCode {
  id: string; code: string; discount_type: string; discount_value: number; is_active: boolean | null;
}

const colorOptions = [
  { value: "blue", label: "أزرق" }, { value: "green", label: "أخضر" },
  { value: "orange", label: "برتقالي" }, { value: "purple", label: "بنفسجي" },
  { value: "red", label: "أحمر" },
];

const iconOptions = [
  { value: "gift", label: "هدية" }, { value: "flame", label: "نار" },
  { value: "zap", label: "برق" }, { value: "clock", label: "ساعة" },
  { value: "percent", label: "نسبة" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("stats");
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerForm, setOfferForm] = useState({
    title: "", subtitle: "", discount: "", bg_color: "blue", icon: "gift",
    badge: "", is_active: true, sort_order: 0, expires_at: "", promo_code_id: "",
  });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [r, o, d, p, of, pc] = await Promise.all([
      supabase.from("restaurants").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("drivers").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("offers").select("*").order("sort_order"),
      supabase.from("promo_codes").select("*").order("created_at", { ascending: false }),
    ]);
    setRestaurants(r.data || []); setOrders(o.data || []);
    setDrivers(d.data || []); setProfiles(p.data || []);
    setOffers((of.data as Offer[]) || []); setPromoCodes((pc.data as PromoCode[]) || []);
    setLoading(false);
  };

  // Offers CRUD
  const openNewOffer = () => {
    setEditingOffer(null);
    setOfferForm({ title: "", subtitle: "", discount: "", bg_color: "blue", icon: "gift", badge: "", is_active: true, sort_order: offers.length + 1, expires_at: "", promo_code_id: "" });
    setShowOfferForm(true);
  };

  const openEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setOfferForm({
      title: offer.title, subtitle: offer.subtitle || "", discount: offer.discount,
      bg_color: offer.bg_color, icon: offer.icon, badge: offer.badge || "",
      is_active: offer.is_active, sort_order: offer.sort_order,
      expires_at: offer.expires_at ? new Date(offer.expires_at).toISOString().slice(0, 16) : "",
      promo_code_id: offer.promo_code_id || "",
    });
    setShowOfferForm(true);
  };

  const saveOffer = async () => {
    if (!offerForm.title.trim() || !offerForm.discount.trim()) { toast.error("يجب ملء العنوان والخصم"); return; }
    const payload = {
      title: offerForm.title.trim(), subtitle: offerForm.subtitle.trim() || null,
      discount: offerForm.discount.trim(), bg_color: offerForm.bg_color, icon: offerForm.icon,
      badge: offerForm.badge.trim() || null, is_active: offerForm.is_active,
      sort_order: offerForm.sort_order,
      expires_at: offerForm.expires_at ? new Date(offerForm.expires_at).toISOString() : null,
      promo_code_id: offerForm.promo_code_id || null,
    };
    if (editingOffer) {
      const { error } = await supabase.from("offers").update(payload).eq("id", editingOffer.id);
      if (error) { toast.error("خطأ في التحديث"); return; }
      setOffers((prev) => prev.map((o) => (o.id === editingOffer.id ? { ...o, ...payload } : o)));
      toast.success("تم تحديث العرض");
    } else {
      const { data, error } = await supabase.from("offers").insert(payload).select().single();
      if (error) { toast.error("خطأ في الإضافة"); return; }
      setOffers((prev) => [...prev, data as Offer]);
      toast.success("تم إضافة العرض");
    }
    setShowOfferForm(false);
  };

  const deleteOffer = async (id: string) => {
    await supabase.from("offers").delete().eq("id", id);
    setOffers((prev) => prev.filter((o) => o.id !== id));
    toast.success("تم حذف العرض");
  };

  const toggleOfferActive = async (id: string, is_active: boolean) => {
    await supabase.from("offers").update({ is_active }).eq("id", id);
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, is_active } : o)));
  };

  const totalRevenue = orders.filter(o => o.status === "delivered").reduce((s, o) => s + Number(o.total || 0), 0);
  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status || "")).length;
  const availableDrivers = drivers.filter((d) => d.status === "available").length;

  const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
    { id: "stats", label: "إحصائيات", icon: BarChart3 },
    { id: "restaurants", label: "المطاعم", icon: Store },
    { id: "orders", label: "الطلبات", icon: ShoppingCart },
    { id: "drivers", label: "المناديب", icon: Truck },
    { id: "users", label: "المستخدمين", icon: Users },
    { id: "offers", label: "العروض", icon: Percent },
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
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<ShoppingCart className="h-5 w-5 text-primary" />} label="إجمالي الطلبات" value={`${orders.length}`} />
              <StatCard icon={<DollarSign className="h-5 w-5 text-success" />} label="إيرادات (مُسلّم)" value={`${totalRevenue.toFixed(0)} ج.م`} />
              <StatCard icon={<TrendingUp className="h-5 w-5 text-warning" />} label="طلبات نشطة" value={`${activeOrders}`} />
              <StatCard icon={<Truck className="h-5 w-5 text-primary" />} label="مناديب متاحين" value={`${availableDrivers}`} />
              <StatCard icon={<Store className="h-5 w-5 text-success" />} label="المطاعم" value={`${restaurants.length}`} />
              <StatCard icon={<Users className="h-5 w-5 text-primary" />} label="المستخدمين" value={`${profiles.length}`} />
            </div>
            <AdminCharts orders={orders} />
          </div>
        )}

        {tab === "restaurants" && <AdminRestaurants restaurants={restaurants} />}
        {tab === "orders" && <AdminOrders orders={orders} restaurants={restaurants} />}
        {tab === "drivers" && <AdminDrivers drivers={drivers} />}
        {tab === "users" && <AdminUsers profiles={profiles} orders={orders} />}

        {tab === "offers" && (
          <div className="space-y-4">
            <Button onClick={openNewOffer} className="w-full rounded-xl h-11 font-semibold">
              <Plus className="h-4 w-4 ml-2" /> إضافة عرض جديد
            </Button>

            {showOfferForm && (
              <div className="bg-card rounded-2xl p-4 shadow-card space-y-3 border-2 border-primary/20">
                <h3 className="font-bold text-foreground text-sm">{editingOffer ? "تعديل العرض" : "عرض جديد"}</h3>
                <Input placeholder="عنوان العرض *" value={offerForm.title} onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })} className="rounded-xl h-10 bg-muted/50 border-0" maxLength={100} />
                <Input placeholder="وصف العرض" value={offerForm.subtitle} onChange={(e) => setOfferForm({ ...offerForm, subtitle: e.target.value })} className="rounded-xl h-10 bg-muted/50 border-0" maxLength={200} />
                <Input placeholder="الخصم (مثال: 25% أو مجاني) *" value={offerForm.discount} onChange={(e) => setOfferForm({ ...offerForm, discount: e.target.value })} className="rounded-xl h-10 bg-muted/50 border-0" maxLength={20} />
                <Input placeholder="شارة (مثال: جديد، حصري)" value={offerForm.badge} onChange={(e) => setOfferForm({ ...offerForm, badge: e.target.value })} className="rounded-xl h-10 bg-muted/50 border-0" maxLength={30} />
                <Input placeholder="ترتيب العرض" type="number" value={offerForm.sort_order} onChange={(e) => setOfferForm({ ...offerForm, sort_order: Number(e.target.value) })} className="rounded-xl h-10 bg-muted/50 border-0" />

                <div>
                  <p className="text-xs text-muted-foreground mb-1">كود الخصم المرتبط (اختياري)</p>
                  <select value={offerForm.promo_code_id} onChange={(e) => setOfferForm({ ...offerForm, promo_code_id: e.target.value })} className="w-full h-10 rounded-xl bg-muted/50 border-0 px-3 text-sm text-foreground">
                    <option value="">— بدون كود خصم —</option>
                    {promoCodes.map((pc) => (
                      <option key={pc.id} value={pc.id}>{pc.code} ({pc.discount_type === "percentage" ? `${pc.discount_value}%` : `${pc.discount_value} ج.م`})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">تاريخ انتهاء العرض (اختياري)</p>
                  <Input type="datetime-local" value={offerForm.expires_at} onChange={(e) => setOfferForm({ ...offerForm, expires_at: e.target.value })} className="rounded-xl h-10 bg-muted/50 border-0" />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">اللون</p>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map((c) => (
                      <button key={c.value} type="button" onClick={() => setOfferForm({ ...offerForm, bg_color: c.value })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${offerForm.bg_color === c.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">الأيقونة</p>
                  <div className="flex gap-2 flex-wrap">
                    {iconOptions.map((ic) => (
                      <button key={ic.value} type="button" onClick={() => setOfferForm({ ...offerForm, icon: ic.value })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${offerForm.icon === ic.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {ic.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">مفعّل</span>
                  <Switch checked={offerForm.is_active} onCheckedChange={(v) => setOfferForm({ ...offerForm, is_active: v })} />
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveOffer} className="flex-1 rounded-xl h-10"><Save className="h-4 w-4 ml-1" /> حفظ</Button>
                  <Button variant="outline" onClick={() => setShowOfferForm(false)} className="rounded-xl h-10">إلغاء</Button>
                </div>
              </div>
            )}

            {offers.map((offer) => (
              <div key={offer.id} className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{offer.title}</h3>
                    <p className="text-xs text-muted-foreground">{offer.subtitle || "—"}</p>
                  </div>
                  <span className="text-lg font-black text-primary">{offer.discount}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${offer.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {offer.is_active ? "مفعّل" : "معطّل"}
                    </span>
                    {offer.badge && <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{offer.badge}</span>}
                    {offer.expires_at && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium">
                        ⏰ {new Date(offer.expires_at).toLocaleDateString("ar-EG")}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Switch checked={offer.is_active} onCheckedChange={(v) => toggleOfferActive(offer.id, v)} />
                    <button onClick={() => openEditOffer(offer)} className="p-2 rounded-lg hover:bg-muted transition-colors"><Pencil className="h-4 w-4 text-muted-foreground" /></button>
                    <button onClick={() => deleteOffer(offer.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="h-4 w-4 text-destructive" /></button>
                  </div>
                </div>
              </div>
            ))}
            {offers.length === 0 && !showOfferForm && <p className="text-center text-muted-foreground py-8">لا توجد عروض</p>}
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
