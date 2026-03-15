import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, Eye, Trash2, MapPin, Phone, Calendar, ShoppingCart } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  default_address: string | null;
  avatar_url: string | null;
  created_at: string;
}

const AdminUsers = ({ profiles: initial, orders }: { profiles: Profile[]; orders: any[] }) => {
  const [profiles, setProfiles] = useState<Profile[]>(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const deleteUser = async (id: string, userId: string) => {
    if (!confirm("هل أنت متأكد؟ سيتم حذف بيانات المستخدم.")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) { toast.error("خطأ في الحذف"); return; }
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    toast.success("تم حذف بيانات المستخدم");
  };

  const getUserOrders = (userId: string) => orders.filter((o: any) => o.customer_id === userId);
  const getUserSpending = (userId: string) => getUserOrders(userId).reduce((s: number, o: any) => s + Number(o.total || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-foreground">المستخدمين ({profiles.length})</h2>
      </div>

      {profiles.map((p) => {
        const userOrders = getUserOrders(p.user_id);
        const spending = getUserSpending(p.user_id);

        return (
          <div key={p.id} className="bg-card rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="font-semibold text-foreground text-sm">{p.full_name || "بدون اسم"}</p>
                <p className="text-xs text-muted-foreground">{p.phone || "—"}</p>
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-foreground">{userOrders.length} طلب</p>
                <p className="text-[11px] text-success">{spending.toFixed(0)} ج.م</p>
              </div>
            </div>

            {expandedId === p.id && (
              <div className="bg-muted/30 rounded-xl p-3 mt-2 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3 w-3" /> {p.phone || "لا يوجد رقم"}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {p.default_address || "لا يوجد عنوان"}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3 w-3" /> تسجيل: {new Date(p.created_at).toLocaleDateString("ar-EG")}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <ShoppingCart className="h-3 w-3" /> {userOrders.length} طلب بإجمالي {spending.toFixed(0)} ج.م
                </div>
                {userOrders.length > 0 && (
                  <div className="border-t border-border pt-1.5 mt-1.5">
                    <p className="font-medium text-foreground mb-1">آخر الطلبات:</p>
                    {userOrders.slice(0, 3).map((o: any) => (
                      <div key={o.id} className="flex justify-between text-muted-foreground py-0.5">
                        <span>#{o.id.slice(0, 8)} — {o.status}</span>
                        <span>{o.total} ج.م</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-1.5 mt-2">
              <Button size="sm" variant="ghost" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)} className="rounded-xl text-xs h-8">
                <Eye className="h-3 w-3 ml-1" /> {expandedId === p.id ? "إخفاء" : "تفاصيل"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteUser(p.id, p.user_id)} className="rounded-xl text-xs h-8 text-destructive hover:text-destructive">
                <Trash2 className="h-3 w-3 ml-1" /> حذف
              </Button>
            </div>
          </div>
        );
      })}
      {profiles.length === 0 && <p className="text-center text-muted-foreground py-8">لا يوجد مستخدمين</p>}
    </div>
  );
};

export default AdminUsers;
