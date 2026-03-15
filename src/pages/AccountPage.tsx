import { User, Settings, HelpCircle, Info, ChevronLeft, LogOut, LogIn, Store, Bike, Sparkles, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import LoyaltyWidget from "@/components/LoyaltyWidget";

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, hasRole, signOut } = useAuth();

  const menuItems = [
    { label: "طلباتي السابقة", icon: ChevronLeft, path: "/orders", show: true },
    { label: "نقاط الولاء والمكافآت", icon: Gift, path: "/loyalty", show: !!user },
    { label: "لوحة المطعم", icon: Store, path: "/restaurant-dashboard", show: hasRole("restaurant_owner") },
    { label: "لوحة السائق", icon: Bike, path: "/driver", show: hasRole("driver") },
    { label: "لوحة التحكم (أدمن)", icon: Settings, path: "/admin", show: hasRole("admin") },
    { label: "التسجيل كمطعم", icon: Store, path: "/restaurant-dashboard", show: !hasRole("restaurant_owner") && !!user },
    { label: "التسجيل كسائق", icon: Bike, path: "/driver", show: !hasRole("driver") && !!user },
    { label: "احصل على المساعدة", icon: HelpCircle, path: "#", show: true },
    { label: "حول التطبيق", icon: Info, path: "#", show: true },
  ].filter((i) => i.show);

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <div className="pt-12 px-4">
        {/* Profile */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {user ? (user.user_metadata?.full_name || "مستخدم طلباتك") : "زائر"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {user ? user.email : "سجل دخولك للمتابعة"}
            </p>
          </div>
        </div>

        {/* Loyalty compact */}
        {user && (
          <div className="mb-4">
            <LoyaltyWidget compact />
          </div>
        )}

        {!user && (
          <Button onClick={() => navigate("/auth")} className="w-full h-12 rounded-xl mb-4 font-semibold text-base">
            <LogIn className="h-5 w-5 ml-2" /> تسجيل الدخول
          </Button>
        )}

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full bg-card rounded-2xl p-4 shadow-card flex items-center justify-between hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {user && (
          <Button
            variant="outline"
            onClick={async () => { await signOut(); navigate("/"); }}
            className="w-full h-12 rounded-xl mt-6 font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5 ml-2" /> تسجيل الخروج
          </Button>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
