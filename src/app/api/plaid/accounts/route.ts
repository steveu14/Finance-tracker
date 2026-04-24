import { plaidClient } from "@/lib/plaid";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { access_token } = await req.json();
    const response = await plaidClient.accountsGet({ access_token });
    return NextResponse.json({ accounts: response.data.accounts });
  } catch (error) {
    console.error("accounts error:", error);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}