import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Truck, Eye, Trash2, UserCheck, UserX, Phone, Star, DollarSign,
  MapPin, CheckCircle, XCircle, Image,
} from "lucide-react";

interface Driver {
  id: string;
  user_id: string;
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

const AdminDrivers = ({ drivers: initial }: { drivers: Driver[] }) => {
  const [drivers, setDrivers] = useState<Driver[]>(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

      {drivers.map((d) => (
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

          {/* Stats row */}
          <div className="flex gap-3 text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-warning" /> {d.rating || 5}</span>
            <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> {d.total_deliveries || 0} توصيلة</span>
            <span className="flex items-center gap-1"><DollarSign className="h-3 w-3 text-success" /> {Number(d.total_earnings || 0).toFixed(0)} ج.م</span>
          </div>

          {/* Expanded details */}
          {expandedId === d.id && (
            <div className="bg-muted/30 rounded-xl p-3 mb-2 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Phone className="h-3 w-3" /> الهاتف: {d.phone || "—"}
              </div>
              {d.license_number && (
                <div className="text-muted-foreground">رقم الرخصة: {d.license_number}</div>
              )}
              {d.current_lat && d.current_lng && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3 w-3" /> الموقع: {d.current_lat.toFixed(4)}, {d.current_lng.toFixed(4)}
                </div>
              )}
              <div className="text-muted-foreground">تسجيل: {new Date(d.created_at).toLocaleDateString("ar-EG")}</div>
              
              {/* ID documents */}
              <div className="border-t border-border pt-2 mt-2">
                <p className="font-medium text-foreground mb-1">مستندات التحقق:</p>
                <div className="flex gap-2">
                  {d.id_card_url ? (
                    <a href={d.id_card_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary text-xs hover:underline">
                      <Image className="h-3 w-3" /> صورة البطاقة
                    </a>
                  ) : <span className="text-muted-foreground">لا توجد صورة بطاقة</span>}
                  {d.selfie_with_id_url ? (
                    <a href={d.selfie_with_id_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary text-xs hover:underline">
                      <Image className="h-3 w-3" /> سيلفي مع البطاقة
                    </a>
                  ) : <span className="text-muted-foreground">لا توجد سيلفي</span>}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-1.5 mt-1 flex-wrap">
            <Button size="sm" variant="ghost" onClick={() => setExpandedId(expandedId === d.id ? null : d.id)} className="rounded-xl text-xs h-8">
              <Eye className="h-3 w-3 ml-1" /> {expandedId === d.id ? "إخفاء" : "تفاصيل"}
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
      {drivers.length === 0 && <p className="text-center text-muted-foreground py-8">لا يوجد مناديب</p>}
    </div>
  );
};

export default AdminDrivers;
