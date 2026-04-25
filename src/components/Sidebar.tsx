"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Transactions", href: "/transactions", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { label: "Accounts", href: "/accounts", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  { label: "Analytics", href: "/analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { label: "Settings", href: "/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3"
        style={{ background: "white", borderBottom: "1px solid #E5E7EB", fontFamily: "'DM Sans', sans-serif" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}>FT</div>
          <span className="font-semibold text-sm" style={{ color: "#111827" }}>Finance Tracker</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: "#6B7280" }}>
          {mobileOpen ? (
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden fixed top-[52px] left-0 right-0 z-20 px-3 py-2"
          style={{ background: "white", borderBottom: "1px solid #E5E7EB", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} style={{ textDecoration: "none" }}>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5"
                  style={{ background: active ? "#EFF6FF" : "transparent", color: active ? "#3B82F6" : "#6B7280" }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col fixed h-full z-10"
        style={{ background: "white", borderRight: "1px solid #E5E7EB", fontFamily: "'DM Sans', sans-serif" }}>
        <div className="px-5 py-5" style={{ borderBottom: "1px solid #F3F4F6" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}>FT</div>
            <span className="font-semibold text-sm" style={{ color: "#111827" }}>Finance Tracker</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
                  style={{ background: active ? "#EFF6FF" : "transparent", color: active ? "#3B82F6" : "#6B7280" }}
                  onMouseOver={(e) => { if (!active) e.currentTarget.style.background = "#F9FAFB"; }}
                  onMouseOut={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4" style={{ borderTop: "1px solid #F3F4F6" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}>U</div>
            <div>
              <p className="text-xs font-semibold" style={{ color: "#111827" }}>My Account</p>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>Personal</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}