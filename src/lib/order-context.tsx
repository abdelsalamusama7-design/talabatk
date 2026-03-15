import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { toast } from "sonner";
import { sampleOrders, Order } from "@/lib/data";

interface OrderContextType {
  orders: Order[];
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const statusMessages: Record<Order["status"], { title: string; icon: string }> = {
  preparing: { title: "جاري تجهيز طلبك 🍳", icon: "⏳" },
  delivering: { title: "المندوب في الطريق إليك 🏍️", icon: "🚀" },
  delivered: { title: "تم تسليم طلبك بنجاح ✅", icon: "🎉" },
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(sampleOrders);

  const updateOrderStatus = useCallback((orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    const order = orders.find((o) => o.id === orderId);
    const msg = statusMessages[status];
    if (order) {
      toast(msg.title, {
        description: `${order.storeName} — طلب #${orderId}`,
        duration: 5000,
        position: "top-center",
      });
    }
  }, [orders]);

  // Simulate status change for the "delivering" order after 15s → delivered
  useEffect(() => {
    const deliveringOrder = orders.find((o) => o.status === "preparing");
    if (!deliveringOrder) return;

    const t1 = setTimeout(() => {
      updateOrderStatus(deliveringOrder.id, "delivering");
    }, 12000);

    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    const deliveringOrder = orders.find((o) => o.status === "delivering");
    if (!deliveringOrder) return;

    const t = setTimeout(() => {
      updateOrderStatus(deliveringOrder.id, "delivered");
    }, 25000);

    return () => clearTimeout(t);
  }, [orders, updateOrderStatus]);

  return (
    <OrderContext.Provider value={{ orders, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
};
