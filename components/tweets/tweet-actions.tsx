"use client";

import React from "react";
import { ITweet } from "./types";
import CommentButton from "./actions/comment-button";
import LikeButton from "./actions/like-button";
import RetweetButton from "./actions/retweet-button";
import ShareButton from "./actions/share-button";
import BookmarkButton from "./actions/bookmark-button";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import TradeButton from "./trade-button";
import { useState, useEffect } from "react";
import posthog from "posthog-js";

const TweetActions = ({ tweet }: { tweet: ITweet }) => {
  const router = useRouter();
  const [isCryptoLoaded, setIsCryptoLoaded] = useState(false);
  const [showTradeButton, setShowTradeButton] = useState(false);

  useEffect(() => {
    // Check if crypto data exists and set state accordingly
    if (tweet?.crypto?.address) {
      setIsCryptoLoaded(true);
      setShowTradeButton(true);
    }
  }, [tweet?.crypto]);

  const goToTradingPage = useCallback(
    (e: React.MouseEvent) => {
      e?.stopPropagation();
      posthog.capture("post_interation", { action: "trade_button_click" })
      if (tweet?.crypto?.address && tweet?.user?.walletAddress) {
        const tokenAddress = tweet?.crypto?.address;
        const referrerAddress = tweet?.user?.walletAddress;
        const url = `/token/${tokenAddress}/${referrerAddress}`;
        router.push(url);
      }
    },
    [router, tweet?.crypto?.address, tweet?.user?.walletAddress]
  );

  return (
    <div className="flex items-center justify-between w-full -ml-2">
      {/* Group all action buttons except TradeButton */}
      <div className="flex items-center">
        <div className="mr-8">
          <CommentButton tweet={tweet} />
        </div>
        <div className="mr-8 restrict-click">
          <LikeButton post={tweet} />
        </div>
        <div className="mr-8 restrict-click">
          <ShareButton tweet={tweet} />
        </div>
        <div className="restrict-click">
          <BookmarkButton post={tweet} />
        </div>
      </div>

      {/* TradeButton will now be pushed to the right */}
      {tweet?.crypto?.address && (
        <TradeButton
          token={{
            address: tweet.crypto.address,
            name: tweet.crypto.name,
            symbol: tweet.crypto.symbol,
            image: tweet.crypto.image,
          }}
          onTradeClick={goToTradingPage}
        />
      )}
    </div>
  );
};

export default TweetActions;
