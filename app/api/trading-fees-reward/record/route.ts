import { NextResponse } from "next/server";
import { ChangeType, ChangeReason } from "@prisma/client";
import prisma from "@/lib/prismadb";

export async function POST(request: Request) {
  try {
    const { referrerAddress, totalTradingFees } = await request.json();

    if (!referrerAddress || typeof totalTradingFees !== "number") {
      return NextResponse.json(
        {
          error:
            "Missing or invalid parameters. Required: referrerAddress (string) and totalTradingFees (number)",
        },
        { status: 400 }
      );
    }

    // Start a transaction to ensure both operations are atomic
    await prisma.$transaction(async (tx) => {
      // First, get the user ID from wallet address
      const user = await tx.user.findUnique({
        where: { walletAddress: referrerAddress },
        select: { id: true },
      });

      if (!user) {
        throw new Error(
          `No user found with wallet address: ${referrerAddress}`
        );
      }

      console.log(`User found: userId=${user.id}`);

      // Calculate reward
      const rewardAmount = totalTradingFees * 0.5;
      console.log(`Reward calculated: rewardAmount=${rewardAmount}`);

      // Get the latest balance - FOR UPDATE to prevent concurrent modifications
      const latestLedgerEntry = await tx.ledger.findFirst({
        where: { userId: user.id },
        orderBy: { timestamp: "desc" },
        select: { currentAmount: true },
      });

      const previousAmount = latestLedgerEntry?.currentAmount ?? 0;
      const currentAmount = previousAmount + rewardAmount;

      // Create new ledger entry
      await tx.ledger.create({
        data: {
          userId: user.id,
          previousAmount,
          changeAmount: rewardAmount,
          currentAmount,
          totalTradingFees: totalTradingFees,
          changeType: ChangeType.POSITIVE,
          changeReason: ChangeReason.EARN,
        },
      });
    });

    console.log("recordTradeRewardByWalletAddress completed successfully.");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to record reward:", error);

    // Handle specific errors
    if (error instanceof Error && error.message.includes("No user found")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to record trade reward" },
      { status: 500 }
    );
  }
}
