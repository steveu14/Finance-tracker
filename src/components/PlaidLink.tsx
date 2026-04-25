"use client";
import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

export function PlaidLink({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  const fetchLinkToken = async () => {
    const res = await fetch("/api/plaid/create-link-token", { method: "POST" });
    const data = await res.json();
    setLinkToken(data.link_token);
    localStorage.setItem("plaid_link_token", data.link_token);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("oauth_state_id")) {
      const saved = localStorage.getItem("plaid_link_token");
      if (saved) setLinkToken(saved);
    }
  }, []);

  const onPlaidSuccess = useCallback(async (public_token: string) => {
    localStorage.removeItem("plaid_link_token");
    const res = await fetch("/api/plaid/exchange-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_token }),
    });
    const data = await res.json();
    onSuccess(data.access_token);
  }, [onSuccess]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    receivedRedirectUri: typeof window !== "undefined" && window.location.search.includes("oauth_state_id")
      ? window.location.href : undefined,
  });

  useEffect(() => {
    if (ready && window.location.search.includes("oauth_state_id")) open();
  }, [ready, open]);

  return (
    <button
      onClick={linkToken ? () => open() : fetchLinkToken}
      disabled={linkToken ? !ready : false}
      style={{
        background: "linear-gradient(135deg, #3B82F6, #6366F1)",
        color: "white",
        border: "none",
        borderRadius: "12px",
        padding: "9px 18px",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        whiteSpace: "nowrap",
        boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
      }}
    >
      {linkToken ? "Connect Bank" : "Get Started"}
    </button>
  );
}