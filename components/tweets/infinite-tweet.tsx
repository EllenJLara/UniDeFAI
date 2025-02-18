"use client";
import { useInView } from "react-intersection-observer";
import { IInfiniteTweets } from "./types";
import Tweet from "./tweet";
import LoadingSpinner from "../elements/loading/loading-spinner";

export const InfiniteTweets = ({
  tweets,
  isSuccess,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
}: {
  tweets: IInfiniteTweets | undefined;
  isSuccess: boolean | undefined;
  isFetchingNextPage: boolean | undefined;
  fetchNextPage: () => Promise<any> | void;
  hasNextPage: boolean | undefined;
}) => {
  const { ref } = useInView({
    onChange: (inView) => {
      inView && hasNextPage && fetchNextPage();
    },
  });

  return (
    <div className="pb-52">
      {isSuccess &&
        tweets?.pages?.map((page) => {
          return page?.tweets?.map((tweet, index) => (
            <div
              ref={index === page.tweets.length - 1 ? ref : undefined}
              key={tweet.id}
              className="border-b border-gray-800"
            >
              <Tweet tweet={tweet} />
            </div>
          ));
        })}

      {isFetchingNextPage && <LoadingSpinner />}
    </div>
  );
};
