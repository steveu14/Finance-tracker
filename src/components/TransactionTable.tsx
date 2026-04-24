import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categoryColors: Record<string, string> = {
  "Food and Drink": "#EFF6FF",
  Travel: "#F0F9FF",
  Shops: "#EEF2FF",
  Recreation: "#F0FDF4",
  Transfer: "#FFF7ED",
  Payment: "#FDF4FF",
};

export function TransactionTable({ transactions }: { transactions: any[] }) {
  return (
    <Card
      className="border-0 shadow-sm rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)" }}
    >
      <CardHeader className="pb-2 border-b border-slate-100">
        <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {["Date", "Merchant", "Category", "Amount"].map((h) => (
                <th
                  key={h}
                  className={`px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider ${h === "Amount" ? "text-right" : "text-left"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => {
              const cat = t.category?.[0] ?? "Other";
              const bg = categoryColors[cat] ?? "#F8FAFC";
              return (
                <tr
                  key={t.transaction_id}
                  className="border-b border-slate-50 transition-colors"
                  style={{ background: i % 2 === 0 ? "transparent" : "rgba(248,250,252,0.5)" }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#EFF6FF")}
                  onMouseOut={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(248,250,252,0.5)")}
                >
                  <td className="px-6 py-3.5 text-slate-400 text-xs">{t.date}</td>
                  <td className="px-6 py-3.5 font-medium text-slate-700">{t.name}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ background: bg, color: "#3B82F6" }}
                    >
                      {cat}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right font-semibold text-slate-700">
                    ${t.amount.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}