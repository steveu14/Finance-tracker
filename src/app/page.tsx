"use client";
import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PlaidLink } from "@/components/PlaidLink";
import { SpendingChart } from "@/components/SpendingChart";
import { saveAccessToken, getAccessToken } from "@/lib/storage";

type TimeRange = "1D" | "7D" | "30D" | "90D";

const MONTH_LABELS: Record<string, string> = {
  "01": "January", "02": "February", "03": "March", "04": "April",
  "05": "May", "06": "June", "07": "July", "08": "August",
  "09": "September", "10": "October", "11": "November", "12": "December",
};

function getCategory(t: any): string {
  return (
    t.personal_finance_category?.primary ??
    t.category?.[0] ??
    "Other"
  ).replace(/_/g, " ").toLowerCase();
}

function filterByRange(transactions: any[], range: TimeRange) {
  const days = range === "1D" ? 1 : range === "7D" ? 7 : range === "30D" ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return transactions.filter((t) => new Date(t.date) >= cutoff);
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<TimeRange>("30D");
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [budgetInput, setBudgetInput] = useState("");
  const [budgetSaved, setBudgetSaved] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const fetchTransactions = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/plaid/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: token }),
      });
      const data = await res.json();
      if (data.transactions) {
        setTransactions(data.transactions);
        localStorage.setItem("cached_transactions", JSON.stringify(data.transactions));
      }
    } catch (e) {
      console.error("Failed to fetch transactions", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem("cached_transactions");
    if (cached) { try { setTransactions(JSON.parse(cached)); } catch {} }
    const stored = localStorage.getItem("budgets");
    if (stored) setBudgets(JSON.parse(stored));
    const token = getAccessToken();
    if (token) fetchTransactions(token);
  }, [fetchTransactions]);

  useEffect(() => {
    setBudgetInput(budgets[selectedMonth] ? String(budgets[selectedMonth]) : "");
    setBudgetSaved(false);
  }, [selectedMonth, budgets]);

  const handleSuccess = async (access_token: string) => {
    saveAccessToken(access_token);
    await fetchTransactions(access_token);
  };

  const saveBudget = () => {
    const amount = parseFloat(budgetInput);
    if (isNaN(amount) || amount <= 0) return;
    const updated = { ...budgets, [selectedMonth]: amount };
    setBudgets(updated);
    localStorage.setItem("budgets", JSON.stringify(updated));
    setBudgetSaved(true);
    setTimeout(() => setBudgetSaved(false), 2000);
  };

  const filtered = filterByRange(transactions, range);
  const totalSpend = filtered.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const avgDaily = totalSpend / (range === "1D" ? 1 : range === "7D" ? 7 : range === "30D" ? 30 : 90);
  const topExpense = filtered.filter((t) => t.amount > 0).reduce(
    (max, t) => (t.amount > max.amount ? t : max),
    { amount: 0, name: "—" }
  );
  const recentTxns = [...filtered]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const availableMonths = Array.from(new Set(transactions.map((t) => t.date.slice(0, 7))))
    .sort((a, b) => b.localeCompare(a));
  if (!availableMonths.includes(currentMonth)) availableMonths.unshift(currentMonth);

  const monthlyTxns = transactions.filter((t) => t.date.startsWith(selectedMonth) && t.amount > 0);
  const monthlySpend = monthlyTxns.reduce((sum, t) => sum + t.amount, 0);
  const budget = budgets[selectedMonth] ?? 0;
  const remaining = budget - monthlySpend;
  const pct = budget > 0 ? Math.min((monthlySpend / budget) * 100, 100) : 0;
  const selectedLabel = `${MONTH_LABELS[selectedMonth.slice(5)] ?? selectedMonth.slice(5)} ${selectedMonth.slice(0, 4)}`;

  const COLORS = ["#3B82F6", "#6366F1", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444"];
  const avatarColors = ["#3B82F6", "#6366F1", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  const summaryCards = [
    {
      label: "Total Spent",
      value: `$${totalSpend.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`,
      sub: range === "1D" ? "today" : range === "7D" ? "last 7 days" : range === "30D" ? "last 30 days" : "last 90 days",
      trendColor: "#EF4444", trend: "↓ Expenses",
      bg: "#FEF2F2", iconColor: "#EF4444",
      icon: "M17 13l-5 5m0 0l-5-5m5 5V6",
    },
    {
      label: "Transactions",
      value: filtered.filter((t) => t.amount > 0).length.toString(),
      sub: "purchases", trendColor: "#6366F1", trend: "↑ Activity",
      bg: "#EEF2FF", iconColor: "#6366F1",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
    {
      label: "Daily Avg",
      value: `$${avgDaily.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`,
      sub: "per day", trendColor: "#0EA5E9", trend: "~ Average",
      bg: "#F0F9FF", iconColor: "#0EA5E9",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
      label: "Top Purchase",
      value: `$${topExpense.amount.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`,
      sub: topExpense.name !== "—" ? topExpense.name.slice(0, 18) : "—",
      trendColor: "#F59E0B", trend: "↑ Biggest",
      bg: "#FFFBEB", iconColor: "#F59E0B",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "#F8FAFF", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />
      <div className="flex-1 md:ml-56 pt-[52px] md:pt-0">

        {/* Header */}
        <header className="px-4 md:px-8 py-3 md:py-4 flex items-center justify-between sticky top-[52px] md:top-0 z-10"
          style={{ background: "rgba(248,250,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E5E7EB" }}>
          <div>
            <h1 className="text-base md:text-lg font-semibold" style={{ color: "#111827" }}>Finance Dashboard</h1>
            <p className="text-xs" style={{ color: "#9CA3AF" }}>Credit card expense tracker</p>
          </div>
          <div className="flex items-center gap-2">
            {transactions.length > 0 && (
              <div className="flex gap-0.5 p-1 rounded-xl" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                {(["1D", "7D", "30D", "90D"] as TimeRange[]).map((r) => (
                  <button key={r} onClick={() => setRange(r)}
                    className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all"
                    style={{
                      background: range === r ? "#3B82F6" : "transparent",
                      color: range === r ? "white" : "#3B82F6",
                    }}>
                    {r}
                  </button>
                ))}
              </div>
            )}
            <PlaidLink onSuccess={handleSuccess} />
          </div>
        </header>

        <main className="p-4 md:p-8 space-y-4 md:space-y-5">

          {/* Empty state */}
          {!loading && transactions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 space-y-5">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #EFF6FF, #EEF2FF)", border: "1px solid #BFDBFE" }}>
                <svg width="32" height="32" fill="none" stroke="#3B82F6" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="2" y="5" width="20" height="14" rx="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path strokeLinecap="round" d="M2 10h20M6 15h4" />
                </svg>
              </div>
              <div className="text-center space-y-1.5">
                <h2 className="text-lg font-semibold" style={{ color: "#111827" }}>No account linked yet</h2>
                <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
                  Tap <span style={{ color: "#3B82F6" }} className="font-semibold">Get Started</span> to connect your credit card.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {["Bank-level encryption", "Read-only access", "CAD supported"].map((label) => (
                  <span key={label} className="text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{ border: "1px solid #BFDBFE", color: "#3B82F6", background: "#EFF6FF" }}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && transactions.length === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "#E5E7EB" }} />
                ))}
              </div>
              <div className="h-64 rounded-2xl animate-pulse" style={{ background: "#E5E7EB" }} />
              <div className="h-48 rounded-2xl animate-pulse" style={{ background: "#E5E7EB" }} />
            </div>
          )}

          {transactions.length > 0 && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {summaryCards.map((card) => (
                  <div key={card.label} className="rounded-2xl p-4 transition-all"
                    style={{ background: "white", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: card.bg }}>
                        <svg width="14" height="14" fill="none" stroke={card.iconColor} strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold tracking-tight mb-1" style={{ color: "#111827" }}>{card.value}</p>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "#9CA3AF" }}>{card.label}</p>
                    <p className="text-xs font-semibold" style={{ color: card.trendColor }}>{card.trend}</p>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="rounded-2xl p-4 md:p-6"
                style={{ background: "white", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-semibold" style={{ color: "#111827" }}>Spending Over Time</h2>
                </div>
                <p className="text-xs mb-4" style={{ color: "#9CA3AF" }}>
                  {range === "1D" ? "Today" : range === "7D" ? "Last 7 days" : range === "30D" ? "Last 30 days" : "Last 90 days"}
                </p>
                <SpendingChart transactions={filtered} range={range} />
              </div>

              {/* Budget */}
              <div className="rounded-2xl p-4 md:p-6"
                style={{ background: "white", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <h2 className="text-sm font-semibold mb-0.5" style={{ color: "#111827" }}>Monthly Budget</h2>
                <p className="text-xs mb-4" style={{ color: "#9CA3AF" }}>Track spending against your budget</p>

                <div className="flex flex-col md:flex-row gap-3 mb-5">
                  <div className="flex-1">
                    <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#6B7280" }}>Month</label>
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm font-medium appearance-none cursor-pointer"
                      style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#111827", outline: "none" }}>
                      {availableMonths.map((m) => (
                        <option key={m} value={m}>{MONTH_LABELS[m.slice(5)] ?? m.slice(5)} {m.slice(0, 4)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#6B7280" }}>Budget (CAD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: "#9CA3AF" }}>$</span>
                      <input type="number" min="0" placeholder="e.g. 2000" value={budgetInput}
                        onChange={(e) => { setBudgetInput(e.target.value); setBudgetSaved(false); }}
                        className="w-full pl-7 pr-4 py-2.5 rounded-xl text-sm font-medium"
                        style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#111827", outline: "none" }}
                        onFocus={(e) => (e.target.style.border = "1px solid #3B82F6")}
                        onBlur={(e) => (e.target.style.border = "1px solid #E5E7EB")} />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button onClick={saveBudget}
                      className="w-full md:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: budgetSaved ? "#ECFDF5" : "linear-gradient(135deg, #3B82F6, #6366F1)",
                        color: budgetSaved ? "#10B981" : "white",
                        border: budgetSaved ? "1px solid #A7F3D0" : "none",
                        minWidth: "100px",
                      }}>
                      {budgetSaved ? "✓ Saved" : "Save"}
                    </button>
                  </div>
                </div>

                {budget > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
                      {[
                        { label: "Budgeted", value: `$${budget.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`, color: "#3B82F6", bg: "#EFF6FF", sub: selectedLabel },
                        { label: "Spent", value: `$${monthlySpend.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`, color: pct >= 90 ? "#EF4444" : pct >= 70 ? "#F59E0B" : "#10B981", bg: pct >= 90 ? "#FEF2F2" : pct >= 70 ? "#FFFBEB" : "#ECFDF5", sub: `${monthlyTxns.length} txns` },
                        { label: remaining >= 0 ? "Remaining" : "Over", value: `$${Math.abs(remaining).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`, color: remaining >= 0 ? "#10B981" : "#EF4444", bg: remaining >= 0 ? "#ECFDF5" : "#FEF2F2", sub: remaining >= 0 ? `${(100 - pct).toFixed(0)}% left` : "over budget" },
                      ].map((c) => (
                        <div key={c.label} className="rounded-xl p-3" style={{ background: c.bg, border: `1px solid ${c.color}22` }}>
                          <p className="text-xs font-medium mb-1" style={{ color: "#6B7280" }}>{c.label}</p>
                          <p className="text-sm md:text-base font-bold truncate" style={{ color: "#111827" }}>{c.value}</p>
                          <p className="text-xs mt-0.5 truncate font-medium" style={{ color: c.color }}>{c.sub}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-medium" style={{ color: "#6B7280" }}>Progress</span>
                        <span className="text-xs font-bold" style={{ color: pct >= 90 ? "#EF4444" : pct >= 70 ? "#F59E0B" : "#10B981" }}>
                          {pct.toFixed(1)}% used
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 90 ? "linear-gradient(90deg, #EF4444, #DC2626)" : pct >= 70 ? "linear-gradient(90deg, #F59E0B, #D97706)" : "linear-gradient(90deg, #3B82F6, #6366F1)",
                          }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs" style={{ color: "#9CA3AF" }}>$0</span>
                        <span className="text-xs" style={{ color: "#9CA3AF" }}>${budget.toLocaleString("en-CA", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {monthlyTxns.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6B7280" }}>By Category</p>
                        {Object.entries(monthlyTxns.reduce((acc: any, t) => {
                          const cat = getCategory(t);
                          acc[cat] = (acc[cat] || 0) + t.amount;
                          return acc;
                        }, {}))
                          .sort((a: any, b: any) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([cat, amount]: any, i) => (
                            <div key={cat}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                  <span className="text-xs font-medium capitalize" style={{ color: "#374151" }}>{cat}</span>
                                </div>
                                <span className="text-xs font-semibold" style={{ color: "#111827" }}>
                                  ${amount.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full" style={{ background: "#F3F4F6" }}>
                                <div className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min((amount / budget) * 100, 100)}%`, background: COLORS[i % COLORS.length] }} />
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 rounded-xl" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                    <p className="text-sm" style={{ color: "#9CA3AF" }}>No budget set for {selectedLabel}.</p>
                  </div>
                )}
              </div>

              {/* Transactions */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="px-4 md:px-6 py-4" style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <h2 className="text-sm font-semibold" style={{ color: "#111827" }}>Recent Transactions</h2>
                  <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{recentTxns.length} most recent</p>
                </div>

                {/* Mobile transaction list */}
                <div className="md:hidden divide-y" style={{ borderColor: "#F3F4F6" }}>
                  {recentTxns.map((t, i) => {
                    const initials = t.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                    const isCredit = t.amount < 0;
                    return (
                      <div key={t.transaction_id} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: avatarColors[i % avatarColors.length] }}>
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "#111827" }}>{t.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs" style={{ color: "#9CA3AF" }}>{t.date}</span>
                            <span className="text-xs" style={{ color: "#D1D5DB" }}>·</span>
                            <span className="text-xs capitalize font-medium" style={{ color: "#6B7280" }}>{getCategory(t)}</span>
                          </div>
                        </div>
                        <span className="text-sm font-bold flex-shrink-0" style={{ color: isCredit ? "#10B981" : "#111827" }}>
                          {isCredit ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
                        {["Transaction", "Date", "Category", "Amount"].map((h) => (
                          <th key={h} className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${h === "Amount" ? "text-right" : "text-left"}`}
                            style={{ color: "#9CA3AF" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentTxns.map((t, i) => {
                        const initials = t.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                        const isCredit = t.amount < 0;
                        return (
                          <tr key={t.transaction_id}
                            style={{ borderBottom: i < recentTxns.length - 1 ? "1px solid #F9FAFB" : "none" }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                  style={{ background: avatarColors[i % avatarColors.length] }}>
                                  {initials}
                                </div>
                                <span className="text-sm font-medium truncate max-w-[180px]" style={{ color: "#111827" }}>{t.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 text-xs" style={{ color: "#9CA3AF" }}>{t.date}</td>
                            <td className="px-6 py-3.5">
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full capitalize"
                                style={{ background: "#F3F4F6", color: "#6B7280" }}>
                                {getCategory(t)}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              <span className="text-sm font-bold" style={{ color: isCredit ? "#10B981" : "#111827" }}>
                                {isCredit ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}