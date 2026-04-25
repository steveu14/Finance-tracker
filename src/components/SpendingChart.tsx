"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

export function SpendingChart({ transactions, range }: { transactions: any[], range: string }) {
  let data: { label: string; total: number }[] = [];

  if (range === "1D") {
    const hourly: Record<string, number> = {};
    transactions.filter((t) => t.amount > 0).forEach((t) => {
      hourly[t.date] = (hourly[t.date] || 0) + t.amount;
    });
    data = Object.entries(hourly).map(([label, total]) => ({ label, total: Number(total.toFixed(2)) }));
  } else if (range === "7D" || range === "30D") {
    const daily: Record<string, number> = {};
    transactions.filter((t) => t.amount > 0).forEach((t) => {
      daily[t.date] = (daily[t.date] || 0) + t.amount;
    });
    data = Object.entries(daily)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, total]) => ({ label: label.slice(5), total: Number(total.toFixed(2)) }));
  } else {
    const monthly: Record<string, number> = {};
    transactions.filter((t) => t.amount > 0).forEach((t) => {
      const month = t.date.slice(0, 7);
      monthly[month] = (monthly[month] || 0) + t.amount;
    });
    data = Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, total]) => ({ label: MONTH_LABELS[key.slice(5)] ?? key, total: Number(total.toFixed(2)) }));
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} dy={6}
          interval={range === "30D" ? 4 : 0} />
        <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false}
          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} width={40} />
        <Tooltip
          contentStyle={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", fontSize: "13px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
          labelStyle={{ color: "#6B7280", marginBottom: "4px" }}
          formatter={(v: any) => [`$${Number(v).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`, "Spent"]}
        />
        <Area type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2.5} fill="url(#areaGrad)"
          dot={{ fill: "#3B82F6", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#3B82F6", strokeWidth: 2, stroke: "white" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}