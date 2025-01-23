import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

const postSelectCriteria = {
  id: true,
  body: true,
  createdAt: true,
  userId: true,
  in_reply_to_tweet_id: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    }
  },
  likes: {
    select: {
      userId: true,
    },
  },
  _count: {
    select: {
      likes: true,
    },
  },
};

export async function GET(req: Request, route: { params: { postId: string } }) {
  try {
    const { postId } = route.params;
    // Fetch the requested post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        ...postSelectCriteria,
        in_reply_to_tweet_id: true,
      },
    });
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // If this is a reply, fetch the parent post
    let responseData: any = { ...post };
    
    if (post.in_reply_to_tweet_id) {
      const parentPost = await prisma.post.findUnique({
        where: { id: post.in_reply_to_tweet_id },
        select: postSelectCriteria,
      });

      if (parentPost) {
        responseData.parent = parentPost;
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    const result = error as Error;
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
}