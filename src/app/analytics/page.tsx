"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { SpendingChart } from "@/components/SpendingChart";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { getAccessToken } from "@/lib/storage";

function getCategory(t: any): string {
  return (
    t.personal_finance_category?.primary ??
    t.category?.[0] ??
    "Other"
  ).replace(/_/g, " ").toLowerCase();
}

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) { setLoading(false); return; }
    fetch("/api/plaid/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token }),
    })
      .then((r) => r.json())
      .then((d) => { setTransactions(d.transactions ?? []); setLoading(false); });
  }, []);

  const totalSpend = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const avgPerMonth = totalSpend / 3;

  const topMerchants = Object.entries(
    transactions.reduce((acc: any, t) => {
      if (t.amount <= 0) return acc;
      acc[t.name] = (acc[t.name] || 0) + t.amount;
      return acc;
    }, {})
  )
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5) as [string, number][];

  const COLORS = ["#3B82F6", "#6366F1", "#0EA5E9", "#10B981", "#F59E0B"];

  return (
    <div className="flex min-h-screen" style={{ background: "#0A0A0A", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />
      <div className="flex-1 ml-56">
        <header
          className="px-8 py-4 sticky top-0 z-10"
          style={{ background: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1F1F1F" }}
        >
          <h1 className="text-lg font-semibold" style={{ color: "#F1F5F9" }}>Analytics</h1>
          <p className="text-xs mt-0.5" style={{ color: "#4B5563" }}>Spending insights over the last 90 days</p>
        </header>

        <main className="p-8 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: "#161616", border: "1px solid #1F1F1F" }} />
              ))}
            </div>
          ) : !getAccessToken() ? (
            <div className="text-center py-24 text-sm" style={{ color: "#4B5563" }}>
              Connect your bank on the Dashboard first.
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Spent", value: `$${totalSpend.toFixed(2)}`, sub: "last 90 days" },
                  { label: "Monthly Average", value: `$${avgPerMonth.toFixed(2)}`, sub: "per month" },
                  { label: "Transactions", value: transactions.filter((t) => t.amount > 0).length, sub: "total purchases" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl p-5" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
                    <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: "#4B5563" }}>{s.label}</p>
                    <p className="text-2xl font-bold" style={{ color: "#F1F5F9" }}>{s.value}</p>
                    <p className="text-xs mt-1" style={{ color: "#4B5563" }}>{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Chart + Category */}
              <div className="grid grid-cols-3 gap-5">
                <div className="col-span-2 rounded-xl p-6" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
                  <h2 className="text-sm font-semibold mb-1" style={{ color: "#F1F5F9" }}>Monthly Spending</h2>
                  <p className="text-xs mb-5" style={{ color: "#4B5563" }}>Last 6 months</p>
                  <SpendingChart transactions={transactions} range="90D" />
                </div>
                <div className="rounded-xl p-6" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
                  <h2 className="text-sm font-semibold mb-1" style={{ color: "#F1F5F9" }}>By Category</h2>
                  <p className="text-xs mb-4" style={{ color: "#4B5563" }}>Breakdown</p>
                  <CategoryBreakdown transactions={transactions} getCategory={getCategory} />
                </div>
              </div>

              {/* Top Merchants */}
              <div className="rounded-xl p-6" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
                <h2 className="text-sm font-semibold mb-1" style={{ color: "#F1F5F9" }}>Top Merchants</h2>
                <p className="text-xs mb-5" style={{ color: "#4B5563" }}>Where you spend the most</p>
                <div className="space-y-4">
                  {topMerchants.map(([name, amount], i) => {
                    const pct = Math.round((amount / totalSpend) * 100);
                    return (
                      <div key={name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ background: COLORS[i] }}
                            >
                              {name[0]}
                            </div>
                            <span className="text-sm font-medium truncate max-w-[200px]" style={{ color: "#E2E8F0" }}>{name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs" style={{ color: "#4B5563" }}>{pct}%</span>
                            <span className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>${amount.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: "#1F2937" }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: COLORS[i], transition: "width 0.6s ease" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}