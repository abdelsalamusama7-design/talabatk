import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Truck, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminNotificationListener = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const isAdmin = hasRole("admin");

  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "drivers" },
        () => {
          toast("🏍️ مندوب جديد سجّل في المنصة", {
            description: "اضغط لمراجعة المناديب",
            icon: <Truck className="h-5 w-5 text-primary" />,
            duration: 8000,
            position: "top-center",
            action: {
              label: "عرض المناديب",
              onClick: () => navigate("/admin"),
            },
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "restaurants" },
        () => {
          toast("🏪 مطعم جديد سجّل في المنصة", {
            description: "اضغط لمراجعة وتفعيل المطعم",
            icon: <Store className="h-5 w-5 text-primary" />,
            duration: 8000,
            position: "top-center",
            action: {
              label: "عرض المطاعم",
              onClick: () => navigate("/admin"),
            },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, navigate]);

  return null;
};

export default AdminNotificationListener;
