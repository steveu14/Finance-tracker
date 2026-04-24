"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { getAccessToken } from "@/lib/storage";

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

export default function BudgetPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [inputAmount, setInputAmount] = useState("");
  const [saved, setSaved] = useState(false);

  // Load budgets from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("budgets");
    if (stored) setBudgets(JSON.parse(stored));
  }, []);

  // Fetch transactions
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

  // When month changes, prefill input with existing budget
  useEffect(() => {
    setInputAmount(budgets[selectedMonth] ? String(budgets[selectedMonth]) : "");
    setSaved(false);
  }, [selectedMonth, budgets]);

  const handleSave = () => {
    const amount = parseFloat(inputAmount);
    if (isNaN(amount) || amount <= 0) return;
    const updated = { ...budgets, [selectedMonth]: amount };
    setBudgets(updated);
    localStorage.setItem("budgets", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Get available months from transactions
  const availableMonths = Array.from(
    new Set(transactions.map((t) => t.date.slice(0, 7)))
  ).sort((a, b) => b.localeCompare(a));

  // Add current month if not in transactions yet
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  if (!availableMonths.includes(currentMonth)) availableMonths.unshift(currentMonth);

  // Calculate spending for selected month
  const monthlyTxns = transactions.filter(
    (t) => t.date.startsWith(selectedMonth) && t.amount > 0
  );
  const totalSpent = monthlyTxns.reduce((sum, t) => sum + t.amount, 0);
  const budget = budgets[selectedMonth] ?? 0;
  const remaining = budget - totalSpent;
  const pct = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

  // Category breakdown for selected month
  const categoryTotals = monthlyTxns.reduce((acc: any, t) => {
    const cat = getCategory(t);
    acc[cat] = (acc[cat] || 0) + t.amount;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryTotals)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 6) as [string, number][];

  const COLORS = ["#3B82F6", "#6366F1", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444"];

  const selectedLabel = `${MONTH_LABELS[selectedMonth.slice(5)] ?? selectedMonth.slice(5)} ${selectedMonth.slice(0, 4)}`;

  return (
    <div className="flex min-h-screen" style={{ background: "#0A0A0A", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />
      <div className="flex-1 ml-56">
        <header className="px-8 py-4 sticky top-0 z-10"
          style={{ background: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1F1F1F" }}>
          <h1 className="text-lg font-semibold" style={{ color: "#F1F5F9" }}>Budget</h1>
          <p className="text-xs mt-0.5" style={{ color: "#4B5563" }}>Set and track your monthly spending limits</p>
        </header>

        <main className="p-8 space-y-6 max-w-4xl">

          {/* Month selector + budget input */}
          <div className="rounded-xl p-6" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
            <h2 className="text-sm font-semibold mb-5" style={{ color: "#F1F5F9" }}>Set Monthly Budget</h2>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="text-xs font-medium uppercase tracking-widest mb-2 block" style={{ color: "#4B5563" }}>
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-medium appearance-none cursor-pointer"
                  style={{
                    background: "#161616",
                    border: "1px solid #2D2D2D",
                    color: "#F1F5F9",
                    outline: "none",
                  }}
                >
                  {availableMonths.map((m) => (
                    <option key={m} value={m} style={{ background: "#161616" }}>
                      {MONTH_LABELS[m.slice(5)] ?? m.slice(5)} {m.slice(0, 4)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="text-xs font-medium uppercase tracking-widest mb-2 block" style={{ color: "#4B5563" }}>
                  Budget Amount (CAD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: "#6B7280" }}>$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2000"
                    value={inputAmount}
                    onChange={(e) => { setInputAmount(e.target.value); setSaved(false); }}
                    className="w-full pl-7 pr-4 py-2.5 rounded-lg text-sm font-medium"
                    style={{
                      background: "#161616",
                      border: "1px solid #2D2D2D",
                      color: "#F1F5F9",
                      outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.border = "1px solid #3B82F6")}
                    onBlur={(e) => (e.target.style.border = "1px solid #2D2D2D")}
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: saved ? "#052e16" : "linear-gradient(135deg, #3B82F6, #6366F1)",
                  color: saved ? "#10B981" : "white",
                  border: saved ? "1px solid #166534" : "none",
                  minWidth: "100px",
                }}
              >
                {saved ? "✓ Saved" : "Save Budget"}
              </button>
            </div>
          </div>

          {/* Budget summary */}
          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: "#161616", border: "1px solid #1F1F1F" }} />
              ))}
            </div>
          ) : (
            <>
              {budget > 0 ? (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label: "Budgeted",
                        value: `$${budget.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`,
                        sub: selectedLabel,
                        color: "#3B82F6",
                        icon: "M9 7H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-2M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M9 7h6",
                      },
                      {
                        label: "Spent",
                        value: `$${totalSpent.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`,
                        sub: `${monthlyTxns.length} transactions`,
                        color: pct >= 90 ? "#EF4444" : pct >= 70 ? "#F59E0B" : "#10B981",
                        icon: "M17 13l-5 5m0 0l-5-5m5 5V6",
                      },
                      {
                        label: remaining >= 0 ? "Remaining" : "Over Budget",
                        value: `$${Math.abs(remaining).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`,
                        sub: remaining >= 0 ? `${(100 - pct).toFixed(0)}% left` : `${(pct - 100).toFixed(0)}% over`,
                        color: remaining >= 0 ? "#10B981" : "#EF4444",
                        icon: remaining >= 0
                          ? "M7 11l5-5m0 0l5 5m-5-5v12"
                          : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
                      },
                    ].map((card) => (
                      <div key={card.label} className="rounded-xl p-5"
                        style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "#4B5563" }}>{card.label}</p>
                            <p className="text-2xl font-bold tracking-tight" style={{ color: "#F1F5F9" }}>{card.value}</p>
                          </div>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "#1A1A1A", border: "1px solid #2D2D2D" }}>
                            <svg width="14" height="14" fill="none" stroke={card.color} strokeWidth="1.8" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                            </svg>
                          </div>
                        </div>
                        <p className="text-xs" style={{ color: "#4B5563" }}>{card.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="rounded-xl p-6" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>Budget Progress — {selectedLabel}</h2>
                      <span className="text-sm font-bold" style={{ color: pct >= 90 ? "#EF4444" : pct >= 70 ? "#F59E0B" : "#10B981" }}>
                        {pct.toFixed(1)}% used
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "#1F2937" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 90
                            ? "linear-gradient(90deg, #EF4444, #DC2626)"
                            : pct >= 70
                            ? "linear-gradient(90deg, #F59E0B, #D97706)"
                            : "linear-gradient(90deg, #3B82F6, #6366F1)",
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs" style={{ color: "#4B5563" }}>$0</span>
                      <span className="text-xs" style={{ color: "#4B5563" }}>
                        ${budget.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Category breakdown */}
                  {topCategories.length > 0 && (
                    <div className="rounded-xl p-6" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
                      <h2 className="text-sm font-semibold mb-5" style={{ color: "#F1F5F9" }}>Spending by Category — {selectedLabel}</h2>
                      <div className="space-y-4">
                        {topCategories.map(([cat, amount], i) => {
                          const catPct = budget > 0 ? Math.min((amount / budget) * 100, 100) : 0;
                          const ofTotal = totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(0) : "0";
                          return (
                            <div key={cat}>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                  <span className="text-xs font-medium capitalize" style={{ color: "#9CA3AF" }}>{cat}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs" style={{ color: "#4B5563" }}>{ofTotal}% of spending</span>
                                  <span className="text-xs font-semibold" style={{ color: "#E2E8F0" }}>
                                    ${amount.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              </div>
                              <div className="w-full h-1.5 rounded-full" style={{ background: "#1F2937" }}>
                                <div className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${catPct}%`, background: COLORS[i % COLORS.length] }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 space-y-3 rounded-xl"
                  style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "#161616", border: "1px solid #2D2D2D" }}>
                    <svg width="24" height="24" fill="none" stroke="#3B82F6" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9 7H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-2M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M9 7h6" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>No budget set for {selectedLabel}</p>
                  <p className="text-xs" style={{ color: "#4B5563" }}>Enter an amount above and click Save Budget to get started.</p>
                </div>
              )}

              {!getAccessToken() && (
                <p className="text-sm text-center py-8" style={{ color: "#4B5563" }}>
                  Connect your bank on the Dashboard to see spending data.
                </p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}