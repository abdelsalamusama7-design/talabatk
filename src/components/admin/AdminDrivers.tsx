import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Truck, Eye, Trash2, UserCheck, UserX, Phone, Star, DollarSign,
  MapPin, Image, Plus, Save, Pencil,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import AdminImageUpload from "./AdminImageUpload";

interface Driver {
  id: string;
  user_id: string;
  name: string | null;
  phone: string | null;
  vehicle_type: string | null;
  status: string | null;
  rating: number | null;
  total_deliveries: number | null;
  total_earnings: number | null;
  verification_status: string | null;
  license_number: string | null;
  id_card_url: string | null;
  selfie_with_id_url: string | null;
  current_lat: number | null;
  current_lng: number | null;
  created_at: string;
}

const emptyForm = {
  name: "", phone: "", vehicle_type: "motorcycle", license_number: "", verification_status: "approved",
  id_card_url: "", selfie_with_id_url: "", email: "",
};

const AdminDrivers = ({ drivers: initial }: { drivers: Driver[] }) => {
  const [drivers, setDrivers] = useState<Driver[]>(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = drivers.filter((d) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      d.id.toLowerCase().includes(q) ||
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.phone && d.phone.includes(q)) ||
      (d.license_number && d.license_number.toLowerCase().includes(q))
    );
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (d: Driver) => {
    setEditingId(d.id);
    setForm({
      name: d.name || "",
      phone: d.phone || "",
      vehicle_type: d.vehicle_type || "motorcycle",
      license_number: d.license_number || "",
      verification_status: d.verification_status || "pending",
      id_card_url: d.id_card_url || "",
      selfie_with_id_url: d.selfie_with_id_url || "",
      email: "",
    });
    setShowForm(true);
  };

  const saveDriver = async () => {
    if (editingId) {
      const { error } = await supabase.from("drivers").update({
        name: form.name || null,
        phone: form.phone || null,
        vehicle_type: form.vehicle_type,
        license_number: form.license_number || null,
        verification_status: form.verification_status,
        id_card_url: form.id_card_url || null,
        selfie_with_id_url: form.selfie_with_id_url || null,
      } as any).eq("id", editingId);
      if (error) { toast.error("خطأ في التحديث"); return; }
      setDrivers((prev) => prev.map((d) => d.id === editingId ? {
        ...d, name: form.name || null, phone: form.phone || null, vehicle_type: form.vehicle_type,
        license_number: form.license_number || null, verification_status: form.verification_status,
        id_card_url: form.id_card_url || null, selfie_with_id_url: form.selfie_with_id_url || null,
      } : d));
      toast.success("تم تحديث المندوب ✅");
    } else {
      if (!form.email?.trim()) { toast.error("يجب إدخال إيميل المندوب"); return; }
      // Look up user by email via profiles or create approach
      // We use supabase admin invite is not available client-side, so we search for existing user
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id")
        .ilike("full_name", `%${form.email.trim()}%`)
        .limit(1);
      
      // Try to find user_id from user_roles or direct lookup
      // Since we can't query auth.users, we'll use the email as a reference
      // First check if there's already a driver with this info
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) { toast.error("يجب تسجيل الدخول"); return; }

      // For admin-created drivers, we need a valid user_id
      // The best approach: admin enters the user_id directly or the driver registers themselves
      // Here we use a workaround: create with a placeholder and update when driver logs in
      const { data, error } = await supabase.from("drivers").insert({
        user_id: adminUser.id,
        name: form.name || null,
        phone: form.phone || null,
        vehicle_type: form.vehicle_type,
        license_number: form.license_number || null,
        verification_status: form.verification_status,
        id_card_url: form.id_card_url || null,
        selfie_with_id_url: form.selfie_with_id_url || null,
        status: "offline" as Database["public"]["Enums"]["driver_status"],
      }).select().single();
      if (error) { toast.error("خطأ في الإضافة: " + error.message); return; }
      setDrivers((prev) => [data as Driver, ...prev]);
      toast.success("تم إضافة المندوب ✅");
    }
    setShowForm(false);
  };

  const updateVerification = async (id: string, status: string) => {
    await supabase.from("drivers").update({ verification_status: status }).eq("id", id);
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, verification_status: status } : d)));
    toast.success(status === "approved" ? "تم تفعيل المندوب ✅" : "تم رفض المندوب");
  };

  const deleteDriver = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المندوب؟")) return;
    const { error } = await supabase.from("drivers").delete().eq("id", id);
    if (error) { toast.error("خطأ في الحذف"); return; }
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    toast.success("تم حذف المندوب");
  };

  const totalEarnings = drivers.reduce((s, d) => s + Number(d.total_earnings || 0), 0);
  const totalDeliveries = drivers.reduce((s, d) => s + Number(d.total_deliveries || 0), 0);

  return (
    <div className="space-y-3">
      <Input
        placeholder="🔍 بحث بالاسم أو رقم الهاتف أو الرخصة..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-xl h-11 bg-muted/50 border-0"
      />
      <Button onClick={openNew} className="w-full rounded-xl h-11 font-semibold">
        <Plus className="h-4 w-4 ml-2" /> إضافة مندوب جديد
      </Button>

      {showForm && (
        <div className="bg-card rounded-2xl p-4 shadow-card space-y-3 border-2 border-primary/20">
          <h3 className="font-bold text-foreground text-sm">{editingId ? "تعديل المندوب" : "مندوب جديد"}</h3>
          <Input placeholder="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl h-10 bg-muted/50 border-0" />
          <div>
            <p className="text-xs text-muted-foreground mb-2">نوع المركبة</p>
            <div className="flex gap-2">
              {[{ v: "motorcycle", l: "🏍️ موتوسيكل" }, { v: "car", l: "🚗 سيارة" }, { v: "bicycle", l: "🚲 دراجة" }].map((opt) => (
                <button key={opt.v} onClick={() => setForm({ ...form, vehicle_type: opt.v })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.vehicle_type === opt.v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
          <Input placeholder="رقم الرخصة" value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} className="rounded-xl h-10 bg-muted/50 border-0" />
          <div className="grid grid-cols-2 gap-3">
            <AdminImageUpload
              bucket="driver-documents"
              folder="id-cards"
              currentUrl={form.id_card_url || null}
              onUploaded={(url) => setForm({ ...form, id_card_url: url })}
              label="صورة البطاقة"
            />
            <AdminImageUpload
              bucket="driver-documents"
              folder="selfies"
              currentUrl={form.selfie_with_id_url || null}
              onUploaded={(url) => setForm({ ...form, selfie_with_id_url: url })}
              label="سيلفي مع البطاقة"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">حالة التوثيق</p>
            <div className="flex gap-2">
              {[{ v: "approved", l: "✅ موثق" }, { v: "pending", l: "⏳ معلق" }, { v: "rejected", l: "❌ مرفوض" }].map((opt) => (
                <button key={opt.v} onClick={() => setForm({ ...form, verification_status: opt.v })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.verification_status === opt.v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveDriver} className="flex-1 rounded-xl h-10"><Save className="h-4 w-4 ml-1" /> حفظ</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl h-10">إلغاء</Button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-card rounded-xl p-3 shadow-card text-center">
          <p className="text-lg font-bold text-foreground">{drivers.length}</p>
          <p className="text-[10px] text-muted-foreground">إجمالي المناديب</p>
        </div>
        <div className="bg-card rounded-xl p-3 shadow-card text-center">
          <p className="text-lg font-bold text-success">{totalEarnings.toFixed(0)}</p>
          <p className="text-[10px] text-muted-foreground">أرباح (ج.م)</p>
        </div>
        <div className="bg-card rounded-xl p-3 shadow-card text-center">
          <p className="text-lg font-bold text-primary">{totalDeliveries}</p>
          <p className="text-[10px] text-muted-foreground">توصيلات</p>
        </div>
      </div>

      {filtered.map((d) => (
        <div key={d.id} className="bg-card rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold text-foreground text-sm">مندوب #{d.id.slice(0, 8)}</p>
              <p className="text-xs text-muted-foreground">
                {d.vehicle_type === "motorcycle" ? "🏍️ موتوسيكل" : d.vehicle_type === "car" ? "🚗 سيارة" : "🚲 دراجة"}
                {d.phone && ` • ${d.phone}`}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                d.status === "available" ? "bg-success/10 text-success" :
                d.status === "busy" ? "bg-warning/10 text-warning" :
                "bg-muted text-muted-foreground"
              }`}>
                {d.status === "available" ? "متاح" : d.status === "busy" ? "مشغول" : "غير متصل"}
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                d.verification_status === "approved" ? "bg-success/10 text-success" :
                d.verification_status === "rejected" ? "bg-destructive/10 text-destructive" :
                "bg-warning/10 text-warning"
              }`}>
                {d.verification_status === "approved" ? "✅ موثق" : d.verification_status === "rejected" ? "❌ مرفوض" : "⏳ قيد المراجعة"}
              </span>
            </div>
          </div>

          <div className="flex gap-3 text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-warning" /> {d.rating || 5}</span>
            <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> {d.total_deliveries || 0} توصيلة</span>
            <span className="flex items-center gap-1"><DollarSign className="h-3 w-3 text-success" /> {Number(d.total_earnings || 0).toFixed(0)} ج.م</span>
          </div>

          {expandedId === d.id && (
            <div className="bg-muted/30 rounded-xl p-3 mb-2 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground"><Phone className="h-3 w-3" /> الهاتف: {d.phone || "—"}</div>
              {d.license_number && <div className="text-muted-foreground">رقم الرخصة: {d.license_number}</div>}
              {d.current_lat && d.current_lng && (
                <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-3 w-3" /> الموقع: {d.current_lat.toFixed(4)}, {d.current_lng.toFixed(4)}</div>
              )}
              <div className="text-muted-foreground">تسجيل: {new Date(d.created_at).toLocaleDateString("ar-EG")}</div>
              <div className="border-t border-border pt-2 mt-2">
                <p className="font-medium text-foreground mb-1">مستندات التحقق:</p>
                <div className="flex gap-2">
                  {d.id_card_url ? (
                    <a href={d.id_card_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary text-xs hover:underline"><Image className="h-3 w-3" /> صورة البطاقة</a>
                  ) : <span className="text-muted-foreground">لا توجد صورة بطاقة</span>}
                  {d.selfie_with_id_url ? (
                    <a href={d.selfie_with_id_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary text-xs hover:underline"><Image className="h-3 w-3" /> سيلفي مع البطاقة</a>
                  ) : <span className="text-muted-foreground">لا توجد سيلفي</span>}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-1.5 mt-1 flex-wrap">
            <Button size="sm" variant="ghost" onClick={() => setExpandedId(expandedId === d.id ? null : d.id)} className="rounded-xl text-xs h-8">
              <Eye className="h-3 w-3 ml-1" /> {expandedId === d.id ? "إخفاء" : "تفاصيل"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => openEdit(d)} className="rounded-xl text-xs h-8">
              <Pencil className="h-3 w-3 ml-1" /> تعديل
            </Button>
            {d.verification_status !== "approved" && (
              <Button size="sm" onClick={() => updateVerification(d.id, "approved")} className="rounded-xl text-xs h-8">
                <UserCheck className="h-3 w-3 ml-1" /> تفعيل
              </Button>
            )}
            {d.verification_status === "approved" && (
              <Button size="sm" variant="outline" onClick={() => updateVerification(d.id, "rejected")} className="rounded-xl text-xs h-8 text-warning border-warning/30">
                <UserX className="h-3 w-3 ml-1" /> إيقاف
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => deleteDriver(d.id)} className="rounded-xl text-xs h-8 text-destructive hover:text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
      {filtered.length === 0 && !showForm && <p className="text-center text-muted-foreground py-8">{search.trim() ? "لا توجد نتائج" : "لا يوجد مناديب"}</p>}
    </div>
  );
};

export default AdminDrivers;
