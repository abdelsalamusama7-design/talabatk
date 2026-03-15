import { User, Settings, HelpCircle, Info, ChevronLeft, ChevronRight, LogOut, LogIn, Store, Bike, Sparkles, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { Button } from "@/components/ui/button";
import LoyaltyWidget from "@/components/LoyaltyWidget";

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, hasRole, signOut } = useAuth();
  const { t, dir, isAr } = useLang();

  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  const menuItems = [
    { label: t("account.myOrders"), icon: ChevronIcon, path: "/orders", show: true },
    { label: t("account.loyalty"), icon: Gift, path: "/loyalty", show: !!user },
    { label: t("account.adminPanel"), icon: Settings, path: "/admin", show: hasRole("admin") },
    { label: t("account.restaurantPanel"), icon: Store, path: "/restaurant-dashboard", show: hasRole("restaurant_owner") },
    { label: t("account.driverPanel"), icon: Bike, path: "/driver", show: hasRole("driver") },
    { label: t("account.registerRestaurant"), icon: Store, path: "/restaurant-dashboard", show: !hasRole("restaurant_owner") && !!user },
    { label: t("account.registerDriver"), icon: Bike, path: "/driver", show: !hasRole("driver") && !!user },
    { label: t("account.help"), icon: HelpCircle, path: "#", show: true },
    { label: t("account.about"), icon: Info, path: "#", show: true },
  ].filter((i) => i.show);

  return (
    <div className="min-h-screen bg-background pb-20" dir={dir}>
      <div className="pt-12 px-4 max-w-2xl mx-auto">
        {/* Profile */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {user ? (user.user_metadata?.full_name || t("account.user")) : t("account.guest")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {user ? user.email : t("account.loginToContinue")}
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
            <LogIn className="h-5 w-5 me-2" /> {t("account.login")}
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
              <ChevronIcon className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {user && (
          <Button
            variant="outline"
            onClick={async () => { await signOut(); navigate("/"); }}
            className="w-full h-12 rounded-xl mt-6 font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5 me-2" /> {t("account.logout")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
