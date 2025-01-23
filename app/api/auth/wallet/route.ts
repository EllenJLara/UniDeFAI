import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function POST(request: Request) {
  try {
    const { walletAddress, userId } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    if (userId) {
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { walletAddress }
      });
      return NextResponse.json(updatedUser);
    } else {
      // Create new user with wallet
      const newUser = await prisma.user.create({
        data: {
          walletAddress,
          username: `user_${walletAddress.slice(0, 6)}`.toLowerCase(),
          name: `User ${walletAddress.slice(0, 6)}`
        }
      });
      return NextResponse.json(newUser);
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}