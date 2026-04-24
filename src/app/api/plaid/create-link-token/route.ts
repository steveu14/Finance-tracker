import { plaidClient } from "@/lib/plaid";
import { NextResponse } from "next/server";
import { Products, CountryCode } from "plaid";

export async function POST() {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: "local-user" },
      client_name: "Finance Tracker",
      products: [Products.Transactions],
      country_codes: [CountryCode.Ca],
      language: "en",
    });
    return NextResponse.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error("create-link-token error:", error);
    return NextResponse.json({ error: "Failed to create link token" }, { status: 500 });
  }
}