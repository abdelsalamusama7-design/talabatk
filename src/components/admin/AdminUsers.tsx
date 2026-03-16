import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Eye, Trash2, MapPin, Phone, Calendar, ShoppingCart,
  ShieldCheck, Store, Bike, User, ChevronDown,
} from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  default_address: string | null;
  avatar_url: string | null;
  created_at: string;
}

type AppRole = "customer" | "restaurant_owner" | "driver" | "admin";

const ROLE_CONFIG: { role: AppRole; label: string; icon: typeof User; color: string }[] = [
  { role: "customer", label: "عميل", icon: User, color: "text-muted-foreground" },
  { role: "driver", label: "سائق", icon: Bike, color: "text-warning" },
  { role: "restaurant_owner", label: "صاحب مطعم", icon: Store, color: "text-success" },
  { role: "admin", label: "أدمن", icon: ShieldCheck, color: "text-primary" },
];

const AdminUsers = ({ profiles: initial, orders }: { profiles: Profile[]; orders: any[] }) => {
  const [profiles, setProfiles] = useState<Profile[]>(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<Record<string, AppRole[]>>({});
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [roleMenuOpen, setRoleMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    loadAllRoles();
  }, []);

  const loadAllRoles = async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("user_id, role");
    if (data) {
      const map: Record<string, AppRole[]> = {};
      data.forEach((r) => {
        if (!map[r.user_id]) map[r.user_id] = [];
        map[r.user_id].push(r.role as AppRole);
      });
      setUserRoles(map);
    }
  };

  const toggleRole = async (userId: string, role: AppRole) => {
    setLoadingRole(userId);
    const currentRoles = userRoles[userId] || [];
    const hasRole = currentRoles.includes(role);
    try {
      if (hasRole) {
        const { error } = await supabase.rpc("admin_remove_role", {
          _target_user_id: userId,
          _role: role,
        });
        if (error) throw error;
        setUserRoles((prev) => ({
          ...prev,
          [userId]: (prev[userId] || []).filter((r) => r !== role),
        }));
        toast.success(`تم إزالة دور "${ROLE_CONFIG.find((r) => r.role === role)?.label}"`);
      } else {
        const { error } = await supabase.rpc("admin_set_role", {
          _target_user_id: userId,
          _role: role,
        });
        if (error) throw error;
        setUserRoles((prev) => ({
          ...prev,
          [userId]: [...(prev[userId] || []), role],
        }));
        toast.success(`تم إضافة دور "${ROLE_CONFIG.find((r) => r.role === role)?.label}"`);
      }
    } catch (e: any) {
      toast.error(e.message || "خطأ في تغيير الدور");
    }
    setLoadingRole(null);
  };

  const deleteUser = async (id: string) => {
    if (!confirm("هل أنت متأكد؟ سيتم حذف بيانات المستخدم.")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) { toast.error("خطأ في الحذف"); return; }
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    toast.success("تم حذف بيانات المستخدم");
  };

  const getUserOrders = (userId: string) => orders.filter((o: any) => o.customer_id === userId);
  const getUserSpending = (userId: string) => getUserOrders(userId).reduce((s: number, o: any) => s + Number(o.total || 0), 0);

  const getRoleBadges = (userId: string) => {
    const roles = userRoles[userId] || [];
    return ROLE_CONFIG.filter((r) => roles.includes(r.role));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-foreground">المستخدمين ({profiles.length})</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {profiles.map((p) => {
          const userOrders = getUserOrders(p.user_id);
          const spending = getUserSpending(p.user_id);
          const badges = getRoleBadges(p.user_id);
          const isRoleMenuOpen = roleMenuOpen === p.user_id;

          return (
            <div key={p.id} className="bg-card rounded-2xl p-4 shadow-card">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="font-semibold text-foreground text-sm flex items-center gap-1">
                    {p.full_name || "بدون اسم"}
                  </p>
                  <p className="text-xs text-muted-foreground">{p.phone || "—"}</p>
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-foreground">{userOrders.length} طلب</p>
                  <p className="text-[11px] text-success">{spending.toFixed(0)} ج.م</p>
                </div>
              </div>

              {/* Role badges */}
              <div className="flex gap-1.5 flex-wrap mt-1.5">
                {badges.map(({ role, label, icon: Icon, color }) => (
                  <span key={role} className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-muted font-medium ${color}`}>
                    <Icon className="h-3 w-3" /> {label}
                  </span>
                ))}
                {badges.length === 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">بدون دور</span>
                )}
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

              {/* Role management dropdown */}
              {isRoleMenuOpen && (
                <div className="bg-muted/40 rounded-xl p-3 mt-2 space-y-1.5">
                  <p className="text-xs font-semibold text-foreground mb-2">إدارة الأدوار</p>
                  {ROLE_CONFIG.map(({ role, label, icon: Icon, color }) => {
                    const hasRole = (userRoles[p.user_id] || []).includes(role);
                    return (
                      <button
                        key={role}
                        onClick={() => toggleRole(p.user_id, role)}
                        disabled={loadingRole === p.user_id}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          hasRole ? "bg-primary/10 text-primary" : "bg-card hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5" /> {label}
                        </span>
                        {hasRole && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">مفعّل</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-1.5 mt-2 flex-wrap">
                <Button size="sm" variant="ghost" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)} className="rounded-xl text-xs h-8">
                  <Eye className="h-3 w-3 ml-1" /> {expandedId === p.id ? "إخفاء" : "تفاصيل"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setRoleMenuOpen(isRoleMenuOpen ? null : p.user_id)}
                  disabled={loadingRole === p.user_id}
                  className="rounded-xl text-xs h-8 text-primary hover:text-primary"
                >
                  <ShieldCheck className="h-3 w-3 ml-1" /> الأدوار <ChevronDown className={`h-3 w-3 mr-0.5 transition-transform ${isRoleMenuOpen ? "rotate-180" : ""}`} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteUser(p.id)} className="rounded-xl text-xs h-8 text-destructive hover:text-destructive">
                  <Trash2 className="h-3 w-3 ml-1" /> حذف
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {profiles.length === 0 && <p className="text-center text-muted-foreground py-8">لا يوجد مستخدمين</p>}
    </div>
  );
};

export default AdminUsers;
