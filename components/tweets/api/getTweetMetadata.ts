import prisma from "@/lib/prismadb";

const tweetSelectCriteria = {
  id: true,
  body: true,
  createdAt: true,
  userId: true,
  image: true,
  media: true,
  in_reply_to_tweet_id: true,
  in_reply_to_screen_name: true,

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

  crypto: true,

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

export const getTweetMetadata = async ({ tweet_id }: { tweet_id: string }) => {
  try {
    const tweet = await prisma.post.findUnique({
      where: {
        id: tweet_id,
      },
      select: {
        ...tweetSelectCriteria,
        in_reply_to_tweet_id: true,
      },
    });

    if (!tweet) {
      return null;
    }

    let responseData: any = { ...tweet };

    if (tweet.in_reply_to_tweet_id) {
      const parentTweets = await getParentTweets(tweet.in_reply_to_tweet_id);
      if (parentTweets.length > 0) {
        responseData.parents = parentTweets;
      }
    }

    return responseData;
  } catch (error) {
    console.error("Error fetching tweet metadata:", error);
    return null;
  }
};
