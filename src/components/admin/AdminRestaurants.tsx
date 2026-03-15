import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Store, UserCheck, UserX, Trash2, Pencil, Plus, Save, X, Eye, MapPin, Phone, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Restaurant {
  id: string;
  name: string;
  category: string;
  address: string | null;
  phone: string | null;
  status: string | null;
  is_open: boolean | null;
  rating: number | null;
  review_count: number | null;
  delivery_fee: number | null;
  delivery_time: string | null;
  min_order: number | null;
  description: string | null;
  owner_id: string;
  created_at: string;
}

const AdminRestaurants = ({ restaurants: initial }: { restaurants: Restaurant[] }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", category: "", address: "", phone: "", delivery_fee: 0, min_order: 0, delivery_time: "", description: "" });

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("restaurants").update({ status: status as any }).eq("id", id);
    setRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(status === "approved" ? "تم تفعيل المطعم ✅" : status === "suspended" ? "تم تعليق المطعم" : "تم تحديث الحالة");
  };

  const toggleOpen = async (id: string, is_open: boolean) => {
    await supabase.from("restaurants").update({ is_open }).eq("id", id);
    setRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, is_open } : r)));
  };

  const startEdit = (r: Restaurant) => {
    setEditingId(r.id);
    setEditForm({
      name: r.name, category: r.category, address: r.address || "",
      phone: r.phone || "", delivery_fee: r.delivery_fee || 0,
      min_order: r.min_order || 0, delivery_time: r.delivery_time || "",
      description: r.description || "",
    });
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from("restaurants").update({
      name: editForm.name, category: editForm.category,
      address: editForm.address || null, phone: editForm.phone || null,
      delivery_fee: editForm.delivery_fee, min_order: editForm.min_order,
      delivery_time: editForm.delivery_time || null, description: editForm.description || null,
    }).eq("id", id);
    if (error) { toast.error("خطأ في التحديث"); return; }
    setRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, ...editForm } : r)));
    setEditingId(null);
    toast.success("تم تحديث المطعم ✅");
  };

  const deleteRestaurant = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المطعم؟")) return;
    const { error } = await supabase.from("restaurants").delete().eq("id", id);
    if (error) { toast.error("خطأ في الحذف - قد يكون مرتبط بطلبات"); return; }
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
    toast.success("تم حذف المطعم");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-foreground">المطاعم ({restaurants.length})</h2>
      </div>

      {restaurants.map((r) => (
        <div key={r.id} className="bg-card rounded-2xl p-4 shadow-card">
          {editingId === r.id ? (
            <div className="space-y-2">
              <Input placeholder="اسم المطعم" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="rounded-xl h-9 text-sm" />
              <Input placeholder="الفئة" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="rounded-xl h-9 text-sm" />
              <Input placeholder="العنوان" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="rounded-xl h-9 text-sm" />
              <Input placeholder="رقم الهاتف" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="rounded-xl h-9 text-sm" />
              <Input placeholder="الوصف" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="rounded-xl h-9 text-sm" />
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="رسوم التوصيل" type="number" value={editForm.delivery_fee} onChange={(e) => setEditForm({ ...editForm, delivery_fee: Number(e.target.value) })} className="rounded-xl h-9 text-sm" />
                <Input placeholder="حد أدنى" type="number" value={editForm.min_order} onChange={(e) => setEditForm({ ...editForm, min_order: Number(e.target.value) })} className="rounded-xl h-9 text-sm" />
                <Input placeholder="وقت التوصيل" value={editForm.delivery_time} onChange={(e) => setEditForm({ ...editForm, delivery_time: e.target.value })} className="rounded-xl h-9 text-sm" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => saveEdit(r.id)} className="rounded-xl h-8 flex-1"><Save className="h-3 w-3 ml-1" /> حفظ</Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="rounded-xl h-8">إلغاء</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{r.name}</h3>
                  <p className="text-xs text-muted-foreground">{r.category} • {r.address || "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                    r.status === "approved" ? "bg-success/10 text-success" :
                    r.status === "pending" ? "bg-warning/10 text-warning" :
                    "bg-destructive/10 text-destructive"
                  }`}>
                    {r.status === "approved" ? "مفعّل" : r.status === "pending" ? "في الانتظار" : r.status === "rejected" ? "مرفوض" : "معلّق"}
                  </span>
                </div>
              </div>

              {/* Expanded details */}
              {expandedId === r.id && (
                <div className="bg-muted/30 rounded-xl p-3 mb-2 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3 w-3" /> {r.phone || "—"}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {r.address || "—"}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Star className="h-3 w-3" /> التقييم: {r.rating || "—"} ({r.review_count || 0} تقييم)
                  </div>
                  <div className="flex gap-3 text-muted-foreground">
                    <span>توصيل: {r.delivery_fee || 0} ج.م</span>
                    <span>حد أدنى: {r.min_order || 0} ج.م</span>
                    <span>الوقت: {r.delivery_time || "—"}</span>
                  </div>
                  {r.description && <p className="text-muted-foreground">{r.description}</p>}
                  <p className="text-muted-foreground">تسجيل: {new Date(r.created_at).toLocaleDateString("ar-EG")}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-foreground font-medium">مفتوح</span>
                    <Switch checked={r.is_open ?? false} onCheckedChange={(v) => toggleOpen(r.id, v)} />
                  </div>
                </div>
              )}

              <div className="flex gap-1.5 mt-2">
                <Button size="sm" variant="ghost" onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className="rounded-xl text-xs h-8">
                  <Eye className="h-3 w-3 ml-1" /> {expandedId === r.id ? "إخفاء" : "تفاصيل"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => startEdit(r)} className="rounded-xl text-xs h-8">
                  <Pencil className="h-3 w-3 ml-1" /> تعديل
                </Button>
                {r.status !== "approved" && (
                  <Button size="sm" onClick={() => updateStatus(r.id, "approved")} className="rounded-xl text-xs h-8">
                    <UserCheck className="h-3 w-3 ml-1" /> تفعيل
                  </Button>
                )}
                {r.status === "approved" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "suspended")} className="rounded-xl text-xs h-8 text-warning border-warning/30">
                    <UserX className="h-3 w-3 ml-1" /> تعليق
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => deleteRestaurant(r.id)} className="rounded-xl text-xs h-8 text-destructive hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </>
          )}
        </div>
      ))}
      {restaurants.length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد مطاعم</p>}
    </div>
  );
};

export default AdminRestaurants;
