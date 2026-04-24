"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { getAccessToken } from "@/lib/storage";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

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

  const categories = ["All", ...Array.from(new Set(transactions.map((t) => t.category?.[0] ?? "Other")))];

  const filtered = transactions
    .filter((t) => filter === "All" || t.category?.[0] === filter)
    .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const avatarColors = ["#3B82F6", "#6366F1", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />
      <div className="flex-1 ml-60">
        <header className="bg-white border-b border-slate-100 px-8 py-4 sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-slate-800">Transactions</h1>
          <p className="text-xs text-slate-400 mt-0.5">All transactions from the last 90 days</p>
        </header>
        <main className="p-8 space-y-5">
          {/* Search + filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-2.5" width="14" height="14" fill="none" stroke="#94A3B8" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all border"
                  style={{
                    background: filter === cat ? "#3B82F6" : "white",
                    color: filter === cat ? "white" : "#64748B",
                    borderColor: filter === cat ? "#3B82F6" : "#E2E8F0",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-white animate-pulse border border-slate-100" />)}
            </div>
          ) : !getAccessToken() ? (
            <div className="text-center py-24 text-slate-400 text-sm">Connect your bank on the Dashboard first.</div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{filtered.length} transactions</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Transaction", "Date", "Category", "Amount"].map((h) => (
                      <th key={h} className={`px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${h === "Amount" ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => {
                    const initials = t.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                    const isIncome = t.amount < 0;
                    return (
                      <tr key={t.transaction_id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{ background: avatarColors[i % avatarColors.length] }}>
                              {initials}
                            </div>
                            <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{t.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-slate-400">{t.date}</td>
                        <td className="px-6 py-3.5">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "#F1F5F9", color: "#64748B" }}>
                            {t.category?.[0] ?? "Other"}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span className="text-sm font-semibold" style={{ color: isIncome ? "#10B981" : "#1E293B" }}>
                            {isIncome ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}