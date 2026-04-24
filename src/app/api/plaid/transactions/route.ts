import { plaidClient } from "@/lib/plaid";
import { NextResponse } from "next/server";

async function fetchWithRetry(
  access_token: string,
  start_date: string,
  end_date: string,
  retries = 8,
  delayMs = 5000
) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await plaidClient.transactionsGet({
        access_token,
        start_date,
        end_date,
        options: { count: 500 },
      });
      return response.data.transactions;
    } catch (err: any) {
      const errorCode = err?.response?.data?.error_code;
      if (errorCode === "PRODUCT_NOT_READY" && i < retries - 1) {
        console.log(`Not ready, retrying in ${delayMs}ms... (attempt ${i + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        throw err;
      }
    }
  }
}

export async function POST(req: Request) {
  try {
    const { access_token } = await req.json();

    const today = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    const transactions = await fetchWithRetry(
      access_token,
      ninetyDaysAgo.toISOString().split("T")[0],
      today.toISOString().split("T")[0]
    );

    return NextResponse.json({ transactions: transactions ?? [] });
  } catch (error: any) {
    console.error("transactions error:", error?.response?.data ?? error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}