import { plaidClient } from "@/lib/plaid";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { access_token } = await req.json();
    const response = await plaidClient.transactionsRecurringGet({
      access_token,
    });
    return NextResponse.json({
      inflow: response.data.inflow_streams,
      outflow: response.data.outflow_streams,
    });
  } catch (error) {
    console.error("recurring-transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch recurring transactions" }, { status: 500 });
  }
}