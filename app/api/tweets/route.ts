import { NextResponse } from "next/server";

import prisma from "@/lib/prismadb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const type = searchParams.get("type") || undefined;
  const id = searchParams.get("id") || undefined;

  const cursorQuery = searchParams.get("cursor") || undefined;
  const take = Number(searchParams.get("limit")) || 20;

  const skip = cursorQuery ? 1 : 0;
  const cursor = cursorQuery ? { id: cursorQuery } : undefined;

  try {
    const tweets = await prisma.post.findMany({
      skip,
      take,
      cursor,

      where: {
        ...(type === "comments" && {
          in_reply_to_tweet_id: id,
        }),

        ...(type === "user_tweets" && {
          userId: id,
          OR: [
            { in_reply_to_tweet_id: { isSet: false } },
            { in_reply_to_tweet_id: null },
          ],
        }),

        ...(type === "user_replies" && {
          userId: id,
          in_reply_to_tweet_id: { not: null },
        }),

        ...(type === "user_likes" && {
          likes: {
            some: {
              userId: id,
            },
          },
        }),

        ...(type === "user_media" && {
          userId: id,
          media: {
            some: {},
          },
        }),

        ...(type === "bookmarks" && {
          Bookmarks: {
            some: {
              userId: id,
            },
          },
        }),

        ...(type === "search" && {
          body: {
            contains: id,
            mode: "insensitive",
          },
        }),

        // Show only original tweets on feed (no reply tweets)
        ...(type === undefined && {
          OR: [
            { in_reply_to_tweet_id: { isSet: false } },
            { in_reply_to_tweet_id: null },
          ],
        }),
      },

      include: {
        likes: true,
        comments: true,
        media: true,
        pinned_by_users: true,
        Bookmarks: {
          include: {
            user: true,
          },
          orderBy: {
            created_at: "desc",
          },
        },

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            username: true,
            walletAddress: true,
            balance: true,
          },
        },
        crypto: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const nextId = Array.isArray(tweets) && tweets.length < take ? undefined : tweets[tweets.length - 1]?.id;

    return NextResponse.json({
      tweets,
      nextId,
    });
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tweets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { tweet } = (await request.json()) as {
    tweet: {
      body: string;
      userId: string;
      cryptoAddress?: string | null;
      tokenData?: {
        name: string;
        symbol: string;
        image: {
          thumb: string;
          small: string;
          large: string;
        };
      };
      in_reply_to_screen_name: string;
      in_reply_to_tweet_id: string;
    };
  };

  try {
    let cryptoId: string | null = null;
    // console.log(tweet);
    if (tweet.cryptoAddress && tweet.tokenData) {
      const coin = await prisma.coin.upsert({
        where: { address: tweet.cryptoAddress },
        update: {
          name: tweet.tokenData.name,
          symbol: tweet.tokenData.symbol,
          image: tweet.tokenData.image,
        },
        create: {
          address: tweet.cryptoAddress,
          name: tweet.tokenData.name,
          symbol: tweet.tokenData.symbol,
          image: tweet.tokenData.image,
        },
      });

      cryptoId = coin.id;
    }

    const created_tweet = await prisma.post.create({
      data: {
        body: tweet.body,
        userId: tweet.userId,
        cryptoId,
        in_reply_to_screen_name: tweet.in_reply_to_screen_name,
        in_reply_to_tweet_id: tweet.in_reply_to_tweet_id,
      },
      include: {
        crypto: true, // Include the crypto data in the response
      },
    });

    return NextResponse.json(created_tweet, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Something went wrong",
        error: error.message,
      },
      { status: error.errorCode || 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") as string;
  const userId = searchParams.get("userId") as string;
  const pinnedParam = searchParams.get("pinned");

  const pinned: boolean = pinnedParam !== null ? pinnedParam === "true" : false;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user && user.pinned_tweet_id === id) {
      await prisma.user.update({
        where: { id: userId },
        data: { pinned_tweet_id: null },
      });
    }

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Tweet deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting tweet:", error?.message || error);
    return NextResponse.json(
      {
        message: "Something went wrong",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}