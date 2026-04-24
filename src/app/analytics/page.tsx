"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { SpendingChart } from "@/components/SpendingChart";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { getAccessToken } from "@/lib/storage";

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

  const totalSpend = transactions.reduce((sum, t) => sum + Math.max(t.amount, 0), 0);
  const avgPerMonth = totalSpend / 3;

  const topMerchants = Object.entries(
    transactions.reduce((acc: any, t) => {
      if (t.amount <= 0) return acc;
      acc[t.name] = (acc[t.name] || 0) + t.amount;
      return acc;
    }, {})
  )
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />
      <div className="flex-1 ml-60">
        <header className="bg-white border-b border-slate-100 px-8 py-4 sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-slate-800">Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">Spending insights over the last 90 days</p>
        </header>
        <main className="p-8 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-white animate-pulse border border-slate-100" />)}
            </div>
          ) : !getAccessToken() ? (
            <div className="text-center py-24 text-slate-400 text-sm">Connect your bank on the Dashboard first.</div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Spent", value: `$${totalSpend.toFixed(2)}`, sub: "last 90 days" },
                  { label: "Monthly Average", value: `$${avgPerMonth.toFixed(2)}`, sub: "per month" },
                  { label: "Transactions", value: transactions.length, sub: "total" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-5">
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">{s.label}</p>
                    <p className="text-2xl font-semibold text-slate-800">{s.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div className="col-span-2 bg-white rounded-xl border border-slate-100 p-6">
                  <h2 className="text-sm font-semibold text-slate-700 mb-1">Monthly Spending</h2>
                  <p className="text-xs text-slate-400 mb-5">Last 6 months</p>
                  <SpendingChart transactions={transactions} />
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-6">
                  <h2 className="text-sm font-semibold text-slate-700 mb-1">By Category</h2>
                  <p className="text-xs text-slate-400 mb-4">Breakdown</p>
                  <CategoryBreakdown transactions={transactions} />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="text-sm font-semibold text-slate-700 mb-1">Top Merchants</h2>
                <p className="text-xs text-slate-400 mb-5">Where you spend the most</p>
                <div className="space-y-4">
                  {topMerchants.map(([name, amount]: any, i) => {
                    const pct = Math.round((amount / totalSpend) * 100);
                    const colors = ["#3B82F6", "#6366F1", "#0EA5E9", "#10B981", "#F59E0B"];
                    return (
                      <div key={name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: colors[i] }}>
                              {name[0]}
                            </div>
                            <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">{pct}%</span>
                            <span className="text-sm font-semibold text-slate-700">${amount.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[i], transition: "width 0.6s ease" }} />
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