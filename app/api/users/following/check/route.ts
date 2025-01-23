import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const targetId = searchParams.get("targetId");

  if (!userId || !targetId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: targetId },
      select: {
        followers: {
          where: {
            id: userId
          }
        }
      }
    });

    const isFollowing = user?.followers.length > 0;
    return NextResponse.json({ isFollowing });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 }); 
  }
}