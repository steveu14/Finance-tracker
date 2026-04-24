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

  // On page load, check if we're returning from an OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isOAuthRedirect = params.get("oauth_state_id");
    if (isOAuthRedirect) {
      const savedToken = localStorage.getItem("plaid_link_token");
      if (savedToken) setLinkToken(savedToken);
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
      ? window.location.href
      : undefined,
  });

  // Auto-open if returning from OAuth redirect
  useEffect(() => {
    if (ready && window.location.search.includes("oauth_state_id")) {
      open();
    }
  }, [ready, open]);

  return (
    <button
      onClick={linkToken ? () => open() : fetchLinkToken}
      disabled={linkToken ? !ready : false}
      style={{
        background: "linear-gradient(135deg, #3B82F6, #6366F1)",
        color: "white",
        border: "none",
        borderRadius: "10px",
        padding: "9px 20px",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.01em",
      }}
      onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {linkToken ? "Connect Bank Account" : "Get Started"}
    </button>
  );
}