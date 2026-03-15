import { useState } from "react";
import { stores as initialStores, sampleOrders, Store } from "@/lib/data";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Plus,
  ArrowRight,
  Truck,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  preparing: { label: "قيد التجهيز", icon: Clock, color: "text-warning bg-warning/10" },
  delivering: { label: "قيد التوصيل", icon: Truck, color: "text-primary bg-accent" },
  delivered: { label: "تم التسليم", icon: CheckCircle, color: "text-success bg-success/10" },
};

type Tab = "stats" | "stores" | "orders";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("stats");
  const [storesList] = useState<Store[]>(initialStores);

  const totalRevenue = sampleOrders.reduce((s, o) => s + o.total, 0);
  const activeOrders = sampleOrders.filter((o) => o.status !== "delivered").length;

  const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
    { id: "stats", label: "الإحصائيات", icon: BarChart3 },
    { id: "stores", label: "المتاجر", icon: Package },
    { id: "orders", label: "الطلبات", icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-primary pt-10 pb-6 px-4 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-primary-foreground">لوحة التحكم</h1>
          <button
            onClick={() => navigate("/")}
            className="bg-card/20 rounded-full p-2"
          >
            <ArrowRight className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-card text-primary shadow-card"
                  : "bg-card/20 text-primary-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        {/* Stats Tab */}
        {tab === "stats" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<ShoppingCart className="h-5 w-5 text-primary" />}
                label="إجمالي الطلبات"
                value={`${sampleOrders.length}`}
              />
              <StatCard
                icon={<BarChart3 className="h-5 w-5 text-success" />}
                label="إجمالي المبيعات"
                value={`${totalRevenue} ج.م`}
              />
              <StatCard
                icon={<Truck className="h-5 w-5 text-warning" />}
                label="طلبات نشطة"
                value={`${activeOrders}`}
              />
              <StatCard
                icon={<Users className="h-5 w-5 text-primary" />}
                label="المناديب المتاحين"
                value="5"
              />
            </div>

            <div className="bg-card rounded-2xl p-4 shadow-card">
              <h3 className="font-semibold mb-3">آخر الطلبات</h3>
              <div className="space-y-3">
                {sampleOrders.map((order) => {
                  const config = statusConfig[order.status];
                  const Icon = config.icon;
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={order.storeImage}
                          alt={order.storeName}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold">{order.storeName}</p>
                          <p className="text-xs text-muted-foreground">
                            المندوب: {order.deliveryPerson}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold tabular-nums">{order.total} ج.م</p>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${config.color}`}
                        >
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Stores Tab */}
        {tab === "stores" && (
          <div className="space-y-4">
            <button className="w-full bg-primary text-primary-foreground py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Plus className="h-5 w-5" />
              إضافة متجر جديد
            </button>

            {storesList.map((store) => (
              <div
                key={store.id}
                className="bg-card rounded-2xl shadow-card overflow-hidden"
              >
                <div className="flex gap-3 p-4">
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{store.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {store.category} • {store.deliveryTime} دقيقة
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {store.products.length} منتج • توصيل {store.deliveryFee} ج.م
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button className="h-8 w-8 rounded-xl bg-accent flex items-center justify-center text-primary">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="h-8 w-8 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Products list */}
                <div className="border-t border-border px-4 py-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-xs">
                        <th className="text-right py-1 font-medium">المنتج</th>
                        <th className="text-right py-1 font-medium">السعر</th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.products.map((p) => (
                        <tr key={p.id} className="border-b border-border last:border-0">
                          <td className="py-1.5 text-foreground">{p.name}</td>
                          <td className="py-1.5 tabular-nums font-medium">{p.price} ج.م</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="space-y-3">
            {/* Orders Table */}
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground text-xs">
                      <th className="text-right p-3 font-medium">المتجر</th>
                      <th className="text-right p-3 font-medium">الخدمة</th>
                      <th className="text-right p-3 font-medium">السعر</th>
                      <th className="text-right p-3 font-medium">الدليفري</th>
                      <th className="text-right p-3 font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleOrders.map((order) => {
                      const config = statusConfig[order.status];
                      const Icon = config.icon;
                      return (
                        <tr key={order.id} className="border-b border-border last:border-0">
                          <td className="p-3 font-semibold">{order.storeName}</td>
                          <td className="p-3 text-muted-foreground">
                            {order.items.map((i) => i.name).join("، ")}
                          </td>
                          <td className="p-3 tabular-nums font-medium">{order.total} ج.م</td>
                          <td className="p-3 text-muted-foreground">{order.deliveryPerson}</td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full font-medium ${config.color}`}
                            >
                              <Icon className="h-3 w-3" />
                              {config.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="bg-card rounded-2xl p-4 shadow-card">
    <div className="mb-2">{icon}</div>
    <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
  </div>
);

export default AdminDashboard;
