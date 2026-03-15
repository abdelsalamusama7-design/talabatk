import { sampleOrders } from "@/lib/data";
import { CheckCircle, Truck, Clock } from "lucide-react";
import DeliveryMap from "@/components/DeliveryMap";

const statusConfig = {
  preparing: { label: "قيد التجهيز", icon: Clock, color: "text-warning" },
  delivering: { label: "قيد التوصيل", icon: Truck, color: "text-primary" },
  delivered: { label: "تم الاستلام", icon: CheckCircle, color: "text-success" },
};

const OrdersPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <div className="pt-12 px-4">
        <h1 className="text-2xl font-bold mb-6">طلباتك</h1>

        <div className="space-y-4">
          {sampleOrders.map((order) => {
            const config = statusConfig[order.status];
            const StatusIcon = config.icon;
            return (
              <div key={order.id} className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <span className={`flex items-center gap-1.5 text-sm font-medium ${config.color}`}>
                    <StatusIcon className="h-4 w-4" />
                    {config.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{order.date}</span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <img src={order.storeImage} alt={order.storeName} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                  <div>
                    <h3 className="font-semibold text-foreground">{order.storeName}</h3>
                    <p className="text-xs text-muted-foreground">رمز الطلب: {order.id}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <div>
                    {order.items.map((item, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        {item.quantity}x {item.name}
                      </p>
                    ))}
                  </div>
                  <span className="font-bold text-foreground tabular-nums">{order.total} ج.م</span>
                </div>

                {order.status === "delivering" && (
                  <div className="mt-4 space-y-3">
                    <div className="bg-accent rounded-xl p-3 text-sm text-accent-foreground">
                      🏍️ المندوب: {order.deliveryPerson}
                    </div>
                    <DeliveryMap deliveryPerson={order.deliveryPerson} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
