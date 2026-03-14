import { User, Settings, HelpCircle, Info, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { label: "طلباتي السابقة", icon: ChevronLeft, path: "/orders" },
  { label: "لوحة التحكم (أدمن)", icon: Settings, path: "/admin" },
  { label: "احصل على المساعدة", icon: HelpCircle, path: "#" },
  { label: "حول التطبيق", icon: Info, path: "#" },
];

const AccountPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <div className="pt-12 px-4">
        {/* Profile */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">مستخدم طلباتك</h2>
            <p className="text-sm text-muted-foreground">مصر 🇪🇬</p>
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full bg-card rounded-2xl p-4 shadow-card flex items-center justify-between hover:shadow-card-hover transition-shadow"
            >
              <span className="font-medium text-foreground">{item.label}</span>
              <item.icon className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
