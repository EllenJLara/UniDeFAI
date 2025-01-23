import { Bookmark, BookmarkActive } from "@/assets/bookmark-icon";
import React, { useState } from "react";
import { useBookmark } from "../hooks/use-bookmark";
import { ITweet } from "../types";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";

const BookmarkButton = ({ post }: { post: ITweet }) => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { data: session }: any = useSession();
  const mutation = useBookmark();

  const isBookmark = post?.Bookmarks?.some(
    (bookmark) => bookmark.userId === session?.user?.id
  );

  const toggleBookmark = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    posthog.capture("post_interation", {
      action: isBookmark ? "remove_bookmark" : "bookmark",
    });

    await mutation.mutateAsync({
      tweetId: post?.id,
      userId: session?.user?.id,
    });
  };
  return (
    <div
      onClick={toggleBookmark}
      className="flex flex-row items-center space-x-1 group cursor-pointer restrict-click"
    >
      <span
        className={`restrict-click rounded-full p-2 fill-gray-600 dark:fill-gray-500  group-hover:fill-blue-400 
      transition-colors duration-200 ease-in-out 
      group-hover:bg-blue-400/10
       h-8 w-8
      ${isBookmark ? "fill-sky-500 dark:fill-sky-500" : ""}
    `}
      >
        {isBookmark ? <BookmarkActive /> : <Bookmark />}
      </span>
    </div>
  );
};

export default BookmarkButton;
