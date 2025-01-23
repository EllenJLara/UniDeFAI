import axios from "axios";
import { postMedia } from "./post-media";
import { retrieveHastagsFromTweet } from "@/components/explore/api/retrieve-hashtags-from-tweet";
import { postHashtags } from "@/components/explore/api/post-hashtags";

interface TokenData {
  name: string;
  symbol: string;
  image: {
    thumb: string | null;
    small: string | null;
    large: string | null;
  };
}

export const PostTweet = async ({
  text,
  userId,
  files,
  cryptoAddress,
  tokenData,
  in_reply_to_screen_name,
  in_reply_to_tweet_id,
}: {
  text: string;
  userId: string;
  files: File[];
  cryptoAddress?: string | null;
  tokenData?: TokenData | null;
  in_reply_to_screen_name?: string | null;
  in_reply_to_tweet_id?: string | null;
}) => {
  const tweet = {
    body: text,
    userId,
    cryptoAddress,
    tokenData, 
    ...(in_reply_to_screen_name && { in_reply_to_screen_name }),
    ...(in_reply_to_tweet_id && { in_reply_to_tweet_id }),
  };

  try {
    const { data } = await axios.post("/api/tweets", { tweet });

    if (files.length > 0) {
      await postMedia({ files, tweet_id: data.id });
    }

    const hashtags = retrieveHastagsFromTweet(text);
    if (hashtags) {
      await postHashtags(hashtags);
    }

    return data;
  } catch (error: any) {
    return error.response.data;
  }
};