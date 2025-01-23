import React, { useCallback, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNowStrict } from "date-fns";
import TweetActions from "./tweet-actions";
import { ITweet } from "./types";
import TweetMedia from "./tweet-media";
import TweetOwnerMenu from "./options/tweet-owner-menu";
import { highlightHashtags } from "./highlight-hashtags";
import { Pin } from "@/assets/pin";
import { useSession } from "next-auth/react";
import TweetVisitorMenu from "./options/tweet-visitor-menu";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import TradeButton from "./trade-button";
import { getTimeAgo } from "@/services/date-service";
import Link from "next/link";
import Image from "next/image";
import { formatCompact } from "./trade-button";

const Tweet = ({
  tweet,
  pinned,
  replyChainMain = false,
  replyChainParent = false,
}: {
  tweet: ITweet;
  pinned?: boolean;
  replyChainMain?: boolean;
  replyChainParent?: boolean;
}) => {
  const portfolioValue = tweet.user.balance?.balanceUsd || null;

  const router = useRouter();
  const { data: session }: any = useSession();

  const goToPost = useCallback(
    (e?: React.MouseEvent) => {
      if (!e) return;

      if (
        e.target === e.currentTarget ||
        (e.target as HTMLElement).closest(".tweet-content") ||
        !(e.target as HTMLElement).classList.contains("restrict-click")
      ) {
        router.push(`/posts/${tweet?.id}`);
      }
    },
    [router, tweet?.id]
  );

  const goToProfile = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(`/profile/${tweet.user.id}`);
    },
    [router, tweet.user.id]
  );
  return (
    <div>
      <Card
        className="bg-transparent w-full max-w-2xl border-0 box-shadow-none shadow-none transition relative"
        onClick={goToPost}
      >
        {pinned && (
          <div className="flex gap-2 mt-3 pl-4">
            <span className="w-4 h-4 dark:fill-neutral-500 fill-zinc-600">
              <Pin />
            </span>
            <span className="text-xs text-light-gray">Pinned post</span>
          </div>
        )}
        <CardContent
          className={`${
            replyChainMain ? "p-0" : replyChainParent ? "p-4 pl-0" : "p-4"
          } hover:bg-gray-50 dark:hover:bg-gray-900/10 cursor-pointer`}
          onClick={(e) => {
            if (window.getSelection()?.toString().length > 0) {
              e.stopPropagation();
              return;
            }
            goToPost(e);
          }}
        >
          <div className="flex items-start space-x-4">
            <div onClick={(e) => e.stopPropagation()}>
              <Avatar
                onClick={goToProfile}
                className="h-8 w-8 cursor-pointer mt-1"
              >
                <AvatarImage src={tweet?.user?.image} alt={tweet?.user?.name} />
                <AvatarFallback>{tweet?.user?.name?.[0]}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between w-full">
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link href={`/profile/${tweet?.user?.id}`} className="group">
                    <div className="flex items-center gap-1">
                      <span className="hover:underline text-sm font-bold text-gray-900 dark:text-gray-100">
                        {tweet?.user?.name}
                      </span>
                      <span className="hidden md:inline text-gray-500 dark:text-gray-400 text-sm">
                        @{tweet?.user?.username}
                      </span>
                    </div>
                  </Link>
                  {portfolioValue !== null && (
                    <div className="flex items-center gap-1">
                      <img
                        width="14"
                        height="14"
                        src="https://img.icons8.com/color/48/verified-account--v1.png"
                        alt="verified-account--v1"
                      />{" "}
                      <div className="flex items-center">
                        <span className="text-green-400 font-semibold text-sm">
                          ${formatCompact(portfolioValue)}
                        </span>
                        <Image
                          src="/images/solana-icon.png"
                          alt="SOL"
                          width={14}
                          height={14}
                          className="ml-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {getTimeAgo(new Date(tweet?.createdAt))}
                  </span>
                  <div
                    className="restrict-click"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {tweet?.user?.id === session?.user?.id ? (
                      <TweetOwnerMenu tweet={tweet} pinned={pinned} />
                    ) : (
                      <TweetVisitorMenu tweet={tweet} />
                    )}
                  </div>
                </div>
              </div>

              <div className="tweet-content cursor-pointer">
                {tweet.in_reply_to_tweet_id && (
                  <div className="text-sm text-light-gray mb-2">
                    <span>Replying to</span>
                    <span className="ml-1 text-sky-500">
                      @{tweet.in_reply_to_screen_name}
                    </span>
                  </div>
                )}

                {tweet?.body && (
                  <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words w-[90%]">
                    {highlightHashtags(tweet?.body)}
                  </div>
                )}

                {tweet?.media?.length > 0 && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <TweetMedia media={tweet?.media} tweet_id={tweet?.id} />
                  </div>
                )}
              </div>

              <div
                className="mt-3 flex items-center justify-between"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPost(e);
                }}
              >
                <TweetActions tweet={tweet} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tweet;
