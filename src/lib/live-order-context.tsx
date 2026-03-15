import { useEffect, useState, useCallback, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface RealtimeOrder {
  id: string;
  status: string;
  items: any[];
  total: number;
  delivery_fee: number;
  subtotal: number;
  delivery_address: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  restaurant_id: string;
  customer_id: string;
  driver_id: string | null;
  scheduled_at: string | null;
  estimated_delivery: string | null;
}

interface LiveOrderContextType {
  liveOrders: RealtimeOrder[];
  loading: boolean;
  refreshOrders: () => Promise<void>;
}

const LiveOrderContext = createContext<LiveOrderContextType | undefined>(undefined);

const statusMessages: Record<string, { title: string; icon: string }> = {
  confirmed: { title: "تم تأكيد طلبك! ✅", icon: "✅" },
  preparing: { title: "جاري تحضير طلبك 🍳", icon: "👨‍🍳" },
  ready: { title: "طلبك جاهز للاستلام! 📦", icon: "📦" },
  picked_up: { title: "المندوب استلم طلبك 🏍️", icon: "🏍️" },
  delivering: { title: "المندوب في الطريق إليك! 🚀", icon: "🚀" },
  delivered: { title: "تم تسليم طلبك بنجاح! 🎉", icon: "🎉" },
  cancelled: { title: "تم إلغاء الطلب ❌", icon: "❌" },
};

export const LiveOrderProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [liveOrders, setLiveOrders] = useState<RealtimeOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshOrders = useCallback(async () => {
    if (!user) {
      setLiveOrders([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setLiveOrders((data as RealtimeOrder[]) || []);
    setLoading(false);
  }, [user]);

  // Initial fetch
  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `customer_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setLiveOrders((prev) => [payload.new as RealtimeOrder, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as RealtimeOrder;
            setLiveOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o))
            );

            // Status update handled silently - no toast or browser notification
          } else if (payload.eventType === "DELETE") {
            setLiveOrders((prev) => prev.filter((o) => o.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <LiveOrderContext.Provider value={{ liveOrders, loading, refreshOrders }}>
      {children}
    </LiveOrderContext.Provider>
  );
};

export const useLiveOrders = () => {
  const ctx = useContext(LiveOrderContext);
  if (!ctx) throw new Error("useLiveOrders must be used within LiveOrderProvider");
  return ctx;
};
