export function saveAccessToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("plaid_access_token", token);
  }
}

export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("plaid_access_token");
  }
  return null;
}

export function clearAccessToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("plaid_access_token");
  }
}