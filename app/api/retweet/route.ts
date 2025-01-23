import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function POST(request: Request) {
  const { user_id, tweet_id } = await request.json();
  try {
    const retweet = await prisma.retweet.create({
      data: {
        userId: user_id,
        postId: tweet_id,
      },
    });
    return NextResponse.json({ status: 'success', retweet_id: retweet.id });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}