"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#3B82F6", "#6366F1", "#0EA5E9", "#38BDF8", "#818CF8", "#93C5FD"];

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.06) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function CategoryBreakdown({
  transactions,
  getCategory,
}: {
  transactions: any[];
  getCategory: (t: any) => string;
}) {
  const byCategory = transactions.reduce((acc: any, t) => {
    if (t.amount <= 0) return acc;
    const cat = getCategory(t);
    acc[cat] = (acc[cat] || 0) + t.amount;
    return acc;
  }, {});

  const data = Object.entries(byCategory)
    .map(([name, value]) => ({ name: name.toLowerCase(), value: Number(Number(value).toFixed(2)) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
            outerRadius={82} innerRadius={46} paddingAngle={2} labelLine={false} label={renderCustomLabel}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#1A1A1A", border: "1px solid #2D2D2D", borderRadius: "10px", fontSize: "12px", color: "#F1F5F9" }}
            formatter={(v: any) => [`$${Number(v).toFixed(2)}`]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2.5">
        {data.map((d, i) => {
          const pct = Math.round((d.value / total) * 100);
          return (
            <div key={d.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs font-medium capitalize truncate max-w-[110px]" style={{ color: "#9CA3AF" }}>{d.name}</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: "#E2E8F0" }}>{pct}%</span>
              </div>
              <div className="w-full h-1 rounded-full" style={{ background: "#1F2937" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length], transition: "width 0.6s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}