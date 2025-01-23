import { NextResponse } from "next/server";
import { ChangeType, ChangeReason, ClaimStatus } from "@prisma/client";
import { fetchBalance } from "@/services/fetchBalance";
import { getConnection } from "@/services/getSolanaConnection";
import { sendRewardsToUser } from "@/services/process-claim-reward/sendRewardsToUser";
import { claimPlatformFeesAndSendRewardsToUser } from "@/services/process-claim-reward/claimPlatformFees";
import { REFERRER_ADDRESS } from "@/components/trading-page/constants";
import prisma from "@/lib/prismadb";

// Initialize Solana connection
const connection = getConnection();
if (!connection) {
  throw new Error("Failed to connect to Solana to claim rewards");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch user and ledger details upfront
    const latestLedger = await prisma.ledger.findFirst({
      where: { userId },
      orderBy: { timestamp: "desc" },
    });

    if (!latestLedger || latestLedger.currentAmount <= 0) {
      return NextResponse.json(
        { error: "No available balance to claim" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true, id: true },
    });

    if (!user?.walletAddress) {
      return NextResponse.json(
        { error: "No wallet address found for user" },
        { status: 400 }
      );
    }

    // Check vault balance
    const vaultBalance = await fetchBalance(connection, REFERRER_ADDRESS);
    let sendRewardSuccess;

    if (vaultBalance >= latestLedger.currentAmount) {
      // Direct transfer to user
      sendRewardSuccess = await sendRewardsToUser(
        connection,
        user.walletAddress,
        latestLedger.currentAmount
      );
    } else {
      // Use platform fees to send rewards
      sendRewardSuccess = await claimPlatformFeesAndSendRewardsToUser(
        connection,
        user.walletAddress,
        latestLedger.currentAmount
      );
    }

    if (!sendRewardSuccess) {
      return NextResponse.json(
        { error: "Failed to distribute rewards to user" },
        { status: 500 }
      );
    }

    // Perform database updates in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Add a claim entry with SUCCESS status
      const newClaim = await tx.claim.create({
        data: {
          userId: user.id,
          claimAmount: latestLedger.currentAmount,
          status: ClaimStatus.SUCCESS,
        },
      });

      console.log("New claim entry created:", newClaim);

      // Update the ledger to reflect the claim
      const newLedger = await tx.ledger.create({
        data: {
          userId: user.id,
          previousAmount: latestLedger.currentAmount,
          changeAmount: latestLedger.currentAmount,
          currentAmount: 0,
          changeType: ChangeType.NEGATIVE,
          changeReason: ChangeReason.CLAIM,
        },
      });

      console.log("New ledger claim entry created:", newLedger);

      return { newClaim, newLedger };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing claim:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process claim",
      },
      { status: 500 }
    );
  }
}
