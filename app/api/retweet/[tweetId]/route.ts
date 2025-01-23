import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function GET(request: Request, { params }: { params: Promise<{ tweet_id: string }> }) {
  const { tweet_id } = await params;
  try {
    const retweets = await prisma.retweet.findMany({
      where: { postId: tweet_id },
      include: { user: true },
    });
    return NextResponse.json({ retweets });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}