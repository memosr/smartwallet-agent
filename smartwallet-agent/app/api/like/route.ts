import { NextRequest, NextResponse } from "next/server";
import { owsSign } from "@/lib/ows";
import {
  getWeeklyTotal,
  addToWeeklyTotal,
  addTransaction,
  wouldExceedLimit,
  generateId,
} from "@/lib/store";

const TIP_AMOUNT = parseFloat(process.env.NEXT_PUBLIC_TIP_AMOUNT ?? "0.01");
const WEEKLY_LIMIT = parseFloat(process.env.NEXT_PUBLIC_WEEKLY_LIMIT ?? "50");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contentId, contentTitle, creatorAddress } = body;

    if (!contentId || !creatorAddress) {
      return NextResponse.json(
        { error: "contentId and creatorAddress are required" },
        { status: 400 }
      );
    }

    const currentTotal = await getWeeklyTotal();

    if (await wouldExceedLimit(TIP_AMOUNT)) {
      await addTransaction({
        id: generateId(),
        contentId,
        contentTitle: contentTitle ?? contentId,
        creatorAddress,
        amount: TIP_AMOUNT,
        currency: "USDC",
        status: "blocked",
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          error: "weekly_limit_exceeded",
          message: `Weekly spending limit of $${WEEKLY_LIMIT} reached.`,
          weeklyTotal: currentTotal,
          limit: WEEKLY_LIMIT,
        },
        { status: 403 }
      );
    }

    const owsResult = await owsSign({
      from: process.env.OWS_WALLET_ADDRESS!,
      to: creatorAddress,
      amount: TIP_AMOUNT,
      currency: "USDC",
      memo: `Tip for: ${contentTitle ?? contentId}`,
    });

    if (!owsResult.success) {
      return NextResponse.json(
        { error: "payment_failed", message: owsResult.error },
        { status: 502 }
      );
    }

    await addToWeeklyTotal(TIP_AMOUNT);
    const newTotal = await getWeeklyTotal();

    await addTransaction({
      id: generateId(),
      contentId,
      contentTitle: contentTitle ?? contentId,
      creatorAddress,
      amount: TIP_AMOUNT,
      currency: "USDC",
      status: "approved",
      txHash: owsResult.txHash,
      mock: owsResult.mock,
      timestamp: owsResult.signedAt ?? new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      txHash: owsResult.txHash,
      mock: owsResult.mock ?? false,
      weeklyTotal: newTotal,
      limit: WEEKLY_LIMIT,
      amount: TIP_AMOUNT,
      currency: "USDC",
    });
  } catch (err) {
    console.error("[/api/like] Unhandled error:", err);
    return NextResponse.json(
      { error: "internal_error", message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
