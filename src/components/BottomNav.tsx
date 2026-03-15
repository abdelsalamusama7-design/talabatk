import { Home, ClipboardList, ShoppingBag, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cart-context";
import { useLang } from "@/lib/lang-context";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { t, dir } = useLang();

  const tabs = [
    { path: "/", label: t("nav.home"), icon: Home },
    { path: "/orders", label: t("nav.orders"), icon: ClipboardList },
    { path: "/cart", label: t("nav.cart"), icon: ShoppingBag },
    { path: "/account", label: t("nav.account"), icon: User },
  ];

  const hiddenPaths = ["/admin", "/restaurant-dashboard", "/driver", "/install", "/auth"];
  if (hiddenPaths.some((p) => location.pathname.startsWith(p))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card shadow-[0_-1px_3px_rgba(0,0,0,0.1)] safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors relative ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.path === "/cart" && itemCount > 0 && (
                <span className="absolute -top-1 right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
