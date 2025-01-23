"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ITweet } from "../types";
import { getTweets } from "../api/get-tweets";

interface IInfiniteTweets {
  nextId: string;
  tweets: ITweet[];
}

export const useTweets = ({
  queryKey = ["tweets"],
  type,
  id,
}: {
  queryKey?: string[];
  type?: string;
  id?: string;
}) => {
  return useInfiniteQuery<IInfiniteTweets>({
    queryKey,
    queryFn: ({ pageParam }) => {
      return getTweets({
        pageParam,
        limit: 20,
        type,
        id,
      });
    },
    initialPageParam: "",

    getNextPageParam: (lastPage) => {
      return lastPage?.nextId;
    },

    refetchOnWindowFocus: false,
  });
};
