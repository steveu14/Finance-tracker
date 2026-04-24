import { plaidClient } from "@/lib/plaid";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { public_token } = await req.json();
    const response = await plaidClient.itemPublicTokenExchange({ public_token });
    return NextResponse.json({ access_token: response.data.access_token });
  } catch (error) {
    console.error("exchange-token error:", error);
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 });
  }
}