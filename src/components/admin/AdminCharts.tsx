import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(45, 93%, 47%)",
  confirmed: "hsl(199, 89%, 48%)",
  preparing: "hsl(25, 95%, 53%)",
  ready: "hsl(152, 69%, 41%)",
  picked_up: "hsl(280, 70%, 50%)",
  delivering: "hsl(199, 89%, 35%)",
  delivered: "hsl(142, 70%, 45%)",
  cancelled: "hsl(0, 84%, 60%)",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "معلق",
  confirmed: "مؤكد",
  preparing: "جاري التحضير",
  ready: "جاهز",
  picked_up: "تم الاستلام",
  delivering: "جاري التوصيل",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

const ARABIC_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-xs" dir="rtl">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === "number" && p.name?.includes("إيراد") ? `${p.value.toFixed(0)} ج.م` : p.value}
        </p>
      ))}
    </div>
  );
};

export const AdminCharts = ({ orders }: { orders: Order[] }) => {
  const dailyData = useMemo(() => {
    const days: Record<string, { orders: number; revenue: number }> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = { orders: 0, revenue: 0 };
    }
    orders.forEach((o) => {
      const key = o.created_at.slice(0, 10);
      if (days[key]) {
        days[key].orders++;
        if (o.status === "delivered") days[key].revenue += Number(o.total || 0);
      }
    });
    return Object.entries(days).map(([date, v]) => ({
      name: `${new Date(date).getDate()}/${new Date(date).getMonth() + 1}`,
      "عدد الطلبات": v.orders,
      "إيرادات (ج.م)": v.revenue,
    }));
  }, [orders]);

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    orders.forEach((o) => {
      if (o.status !== "delivered") return;
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] || 0) + Number(o.total || 0);
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, val]) => ({
        name: ARABIC_MONTHS[parseInt(key.split("-")[1]) - 1],
        "إيرادات (ج.م)": val,
      }));
  }, [orders]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      const s = o.status || "pending";
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: STATUS_COLORS[status] || "hsl(0,0%,60%)",
    }));
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="text-sm font-bold text-foreground mb-4">📊 الطلبات اليومية (آخر 14 يوم)</h3>
          <div className="h-[220px] lg:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="عدد الطلبات" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="text-sm font-bold text-foreground mb-4">💰 الإيرادات الشهرية</h3>
          {monthlyData.length > 0 ? (
            <div className="h-[220px] lg:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="إيرادات (ج.م)" stroke="hsl(142, 70%, 45%)" strokeWidth={3} dot={{ r: 5, fill: "hsl(142, 70%, 45%)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm py-8">لا توجد بيانات إيرادات بعد</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="text-sm font-bold text-foreground mb-4">📈 إيرادات يومية (آخر 14 يوم)</h3>
          <div className="h-[220px] lg:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="إيرادات (ج.م)" fill="hsl(142, 70%, 45%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="text-sm font-bold text-foreground mb-4">🥧 توزيع حالات الطلبات</h3>
          {statusData.length > 0 ? (
            <div className="h-[260px] lg:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm py-8">لا توجد طلبات بعد</p>
          )}
        </div>
      </div>
    </div>
  );
};
