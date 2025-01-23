"use client";

import React, { useRef, useEffect, memo } from "react";
import { usePathname } from "next/navigation";
import { useTweet } from "./hooks/use-tweet";
import CreateTweetWrapper from "../create-tweet/create-tweet-wrapper";
import Comments from "./comments";
import LoadingSpinner from "../elements/loading/loading-spinner";
import TryAgain from "../elements/try-again";
import ParentTweet from "./parent-tweet";
import { ITweet } from "./types";
import Tweet from "./tweet";

const CONTAINER_STYLES = {
  overflow: "auto",
  msOverflowStyle: "none" as const,
  scrollbarWidth: "none" as const,
};

interface TweetDetailsProps {
  initialTweet?: ITweet;
}

const MemoizedParentTweet = memo(
  ({
    tweet,
    isFirst,
    isLast,
  }: {
    tweet: ITweet;
    isFirst: boolean;
    isLast: boolean;
  }) => (
    <div className="relative mb-4">
      <div className="absolute" />
      <ParentTweet tweet={tweet} isFirst={isFirst} isLast={isLast} />
    </div>
  )
);

MemoizedParentTweet.displayName = "MemoizedParentTweet";

const TweetDetails = ({ initialTweet }) => {
  const pathname = usePathname();
  const tweetId = pathname.split("/")[2];
  const mainTweetRef = useRef<HTMLDivElement>(null);

  const {
    data: tweet,
    isPending,
    isError,
  } = useTweet({
    id: tweetId,
    initialData: initialTweet,
  });

  useEffect(() => {
    const scrollToTweet = () => {
      mainTweetRef.current?.scrollIntoView({ behavior: "auto" });
    };

    if (tweet) {
      scrollToTweet();
    }
  }, [tweet]);

  if (isPending) return <LoadingSpinner />;
  if (isError) return <TryAgain />;
  if (!tweet) return null;

  const parentTweets = tweet?.parents ? [...tweet?.parents].reverse() : [];

  return (
    <div className="relative container max-w-2xl mx-auto h-full px-4">
      <div className="tweet-thread">
        {parentTweets.length > 0 && (
          <div className="parent-tweets mb-4">
            {parentTweets.map((parentTweet, index) => (
              <MemoizedParentTweet
                key={parentTweet.id}
                tweet={parentTweet}
                isFirst={index === 0}
                isLast={index === parentTweets.length - 1}
              />
            ))}
          </div>
        )}

        <div
          ref={mainTweetRef}
          className="main-tweet mb-4 mt-2 overflow-visible"
        >
          <Tweet replyChainMain={true} tweet={initialTweet} />
        </div>

        <div className="reply-section dark:bg-[#101318] mb-4 p-4 rounded-lg">
          <CreateTweetWrapper
            in_reply_to_screen_name={tweet.user?.username ?? ""}
            in_reply_to_tweet_id={tweet.id}
          />
        </div>
        <div className="comments-section min-h-[45vh]">
          <Comments tweetId={tweet.id} />
        </div>
      </div>
    </div>
  );
};

export default memo(TweetDetails);