import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

const tweetSelectCriteria = {
  id: true,
  body: true,
  userId: true,
  createdAt: true,
  image: true,
  media: true,
  in_reply_to_tweet_id: true,
  in_reply_to_screen_name: true,
  crypto: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      username: true,
    },
  },
  likes: {
    select: {
      userId: true,
    },
  },
  Bookmarks: {
    select: {
      id: true,
      userId: true,
    },
  },
  _count: {
    select: {
      likes: true,
      comments: true,
      Bookmarks: true,
    },
  },
};

async function getParentTweets(tweetId: string): Promise<any[]> {
  const parents: any[] = [];
  let currentTweetId = tweetId;
  while (currentTweetId) {
    const parentTweet = await prisma.post.findUnique({
      where: { id: currentTweetId },
      select: tweetSelectCriteria,
    });
    if (!parentTweet || !parentTweet.in_reply_to_tweet_id) {
      if (parentTweet) {
        parents.push(parentTweet);
      }
      break;
    }
    parents.push(parentTweet);
    currentTweetId = parentTweet.in_reply_to_tweet_id;
  }
  return parents;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const tweet = await prisma.post.findUnique({
      where: { id },
      select: {
        ...tweetSelectCriteria,
        in_reply_to_tweet_id: true,
        in_reply_to_screen_name: true,
      },
    });

    if (!tweet) {
      return NextResponse.json({ message: "Tweet not found" }, { status: 404 });
    }

    let responseData: any = { ...tweet };

    if (tweet.in_reply_to_tweet_id) {
      const parentTweets = await getParentTweets(tweet.in_reply_to_tweet_id);
      if (parentTweets.length > 0) {
        responseData.parents = parentTweets;
      }
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error fetching tweet:", error);
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
}
