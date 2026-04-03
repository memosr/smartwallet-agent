/**
 * app/api/transactions/route.ts
 * Returns the full transaction history and current weekly spend state.
 */

import { NextResponse } from "next/server";
import { getTransactions, getWeeklyTotal } from "@/lib/store";

const WEEKLY_LIMIT = parseFloat(process.env.NEXT_PUBLIC_WEEKLY_LIMIT ?? "50");

export async function GET() {
  try {
    const transactions = getTransactions();
    const weeklyTotal = getWeeklyTotal();

    return NextResponse.json({
      transactions,
      weeklyTotal,
      limit: WEEKLY_LIMIT,
      remaining: Math.max(0, WEEKLY_LIMIT - weeklyTotal),
    });
  } catch (err) {
    console.error("[/api/transactions] Unhandled error:", err);
    return NextResponse.json(
      { error: "internal_error", message: "Failed to fetch transactions." },
      { status: 500 }
    );
  }
}
