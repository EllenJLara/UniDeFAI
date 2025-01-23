import prisma from "@/lib/prismadb";
import { fetchBalanceInUsd } from "@/services/fetchBalance";
import { getConnection } from "@/services/getSolanaConnection";
import { Account } from "@solana/web3.js";
import RateLimiter from "./RateLimiter";

const connection = getConnection();
if (!connection) {
  throw new Error("Failed to initialize Solana connection.");
}


export async function updateUserBalances() {
  try {
    const connection = getConnection();
    if (!connection) {
      throw new Error("Failed to initialize Solana connection.");
    }

    const users = await prisma.user.findMany({
      where: { walletAddress: { not: null } },
      select: { id: true, walletAddress: true }
    });

    const rateLimiter = new RateLimiter(5, 4);
    const updates: Promise<void>[] = [];

    for (const user of users) {
      if (!user.walletAddress) continue;
      
      updates.push(
        rateLimiter.add(async () => {
          const balanceUsd = await fetchBalanceInUsd(connection, user?.walletAddress!);
          console.log("Balance fetched for", user?.walletAddress);

          await prisma.userBalance.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              balanceUsd,
              lastUpdated: new Date()
            },
            update: {
              balanceUsd,
              lastUpdated: new Date()
            }
          });
        })
      );
    }

    await Promise.all(updates);
  } catch (error) {
    console.error("Error updating balances:", error);
    throw error;
  }
}