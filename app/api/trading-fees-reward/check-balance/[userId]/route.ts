import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    if (!userId) {
      // Return 0 balance instead of error for missing userId
      return NextResponse.json({ balance: 0 });
    }

    // No need for transaction since we're just reading
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    // If no user found, return 0 balance instead of error
    if (!user) {
      console.log(`No user found with ID: ${userId}, returning 0 balance`);
      return NextResponse.json({ balance: 0 });
    }

    // Get the latest balance
    const latestLedgerEntry = await prisma.ledger.findFirst({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
      select: { currentAmount: true },
    });

    const currentBalance = latestLedgerEntry?.currentAmount ?? 0;
    console.log(`Current balance retrieved: ${currentBalance}`);

    return NextResponse.json({ balance: currentBalance });
  } catch (error) {
    console.error("Failed to check balance:", error);
    // Return 0 balance instead of error for any failures
    return NextResponse.json({ balance: 0 });
  }
}
