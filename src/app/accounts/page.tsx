"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { getAccessToken } from "@/lib/storage";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) { setLoading(false); return; }
    fetch("/api/plaid/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token }),
    })
      .then((r) => r.json())
      .then((d) => { setAccounts(d.accounts ?? []); setLoading(false); });
  }, []);

  const typeColors: Record<string, { bg: string; color: string }> = {
    depository: { bg: "#EFF6FF", color: "#3B82F6" },
    credit: { bg: "#FEF2F2", color: "#EF4444" },
    investment: { bg: "#ECFDF5", color: "#10B981" },
    loan: { bg: "#FFF7ED", color: "#F59E0B" },
    other: { bg: "#F8FAFC", color: "#64748B" },
  };

  return (
    <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />
      <div className="flex-1 ml-60">
        <header className="bg-white border-b border-slate-100 px-8 py-4 sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-slate-800">Accounts</h1>
          <p className="text-xs text-slate-400 mt-0.5">Your linked bank accounts</p>
        </header>
        <main className="p-8">
          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-36 rounded-xl bg-white animate-pulse border border-slate-100" />)}
            </div>
          ) : !getAccessToken() ? (
            <div className="text-center py-24 text-slate-400 text-sm">Connect your bank on the Dashboard first.</div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {accounts.map((acc) => {
                const style = typeColors[acc.type] ?? typeColors.other;
                return (
                  <div key={acc.account_id} className="bg-white rounded-xl border border-slate-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: style.bg }}>
                        <svg width="18" height="18" fill="none" stroke={style.color} strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full capitalize" style={{ background: style.bg, color: style.color }}>
                        {acc.type}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-0.5">{acc.name}</p>
                    <p className="text-xs text-slate-400 mb-4 capitalize">{acc.subtype} · ••••{acc.mask}</p>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Current Balance</p>
                      <p className="text-2xl font-semibold text-slate-800">
                        ${acc.balances?.current?.toFixed(2) ?? "—"}
                      </p>
                    </div>
                    {acc.balances?.available != null && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-400">Available: <span className="text-slate-600 font-medium">${acc.balances.available.toFixed(2)}</span></p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}