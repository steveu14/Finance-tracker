"use client";
import { Sidebar } from "@/components/Sidebar";
import { clearAccessToken, getAccessToken } from "@/lib/storage";
import { useState } from "react";

export default function SettingsPage() {
  const [disconnected, setDisconnected] = useState(false);
  const hasToken = getAccessToken();

  const handleDisconnect = () => {
    clearAccessToken();
    setDisconnected(true);
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#0A0A0A", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />
      <div className="flex-1 ml-56">
        <header
          className="px-8 py-4 sticky top-0 z-10"
          style={{ background: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1F1F1F" }}
        >
          <h1 className="text-lg font-semibold" style={{ color: "#F1F5F9" }}>Settings</h1>
          <p className="text-xs mt-0.5" style={{ color: "#4B5563" }}>Manage your account and preferences</p>
        </header>

        <main className="p-8 max-w-2xl space-y-5">

          <div className="rounded-xl p-6 space-y-4" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
            <h2 className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>Connected Account</h2>
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: "#161616" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "#1A1A1A", border: "1px solid #2D2D2D" }}>
                  <svg width="16" height="16" fill="none" stroke="#3B82F6" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>Bank Account</p>
                  <p className="text-xs" style={{ color: "#4B5563" }}>
                    {disconnected || !hasToken ? "No account connected" : "Connected via Plaid"}
                  </p>
                </div>
              </div>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  background: disconnected || !hasToken ? "#1A1A1A" : "#052e16",
                  color: disconnected || !hasToken ? "#4B5563" : "#10B981",
                  border: `1px solid ${disconnected || !hasToken ? "#2D2D2D" : "#166534"}`,
                }}
              >
                {disconnected || !hasToken ? "Disconnected" : "Active"}
              </span>
            </div>

            {!disconnected && hasToken && (
              <button
                onClick={handleDisconnect}
                className="w-full py-2.5 text-sm font-medium rounded-lg transition-colors"
                style={{ color: "#EF4444", border: "1px solid #2D2D2D", background: "transparent" }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#1A1A1A")}
                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Disconnect Account
              </button>
            )}

            {(disconnected || !hasToken) && (
              <a href="/">
                <button
                  className="w-full py-2.5 text-sm font-medium rounded-lg transition-colors"
                  style={{ color: "#3B82F6", border: "1px solid #1F2937", background: "transparent" }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#111827")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Connect a Bank Account
                </button>
              </a>
            )}
          </div>

          <div className="rounded-xl p-6 space-y-4" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
            <h2 className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>About</h2>
            <div className="space-y-3">
              {[
                { label: "Version", value: "1.0.0" },
                { label: "Data source", value: "Plaid API" },
                { label: "Environment", value: process.env.NEXT_PUBLIC_PLAID_ENV ?? "production" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-2"
                  style={{ borderBottom: "1px solid #1A1A1A" }}>
                  <span className="text-sm" style={{ color: "#4B5563" }}>{item.label}</span>
                  <span className="text-sm font-medium capitalize" style={{ color: "#F1F5F9" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}