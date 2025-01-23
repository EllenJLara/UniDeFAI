import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { ITweet } from "../types";
import { useLike } from "../hooks/use-like";
import { HeartIcon, HeartIconActive } from "@/assets/heart-icon";
import { motion } from "framer-motion";
import AuthDialog from "@/components/dialogs/auth-dialog";
import posthog from "posthog-js";

const LikeButton = ({ post }: { post: ITweet }) => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);
  const { data: session }: any = useSession();
  const mutation = useLike();

  const hasLiked =
    optimisticLiked !== null
      ? optimisticLiked
      : post?.likes?.some((like) => like.userId === session?.user?.id);

  const likeCount =
    optimisticCount !== null ? optimisticCount : post?._count?.likes || 0;

  const handleLikeClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    posthog.capture("post_interation", {
      action: hasLiked ? "unlike" : "like",
    });
    if (!session?.user?.id) {
      setShowAuthDialog(true);
      return;
    }

    // Instantly update UI
    const newLikedState = !hasLiked;
    setOptimisticLiked(newLikedState);
    setOptimisticCount(likeCount + (newLikedState ? 1 : -1));

    try {
      await mutation.mutateAsync({
        tweetId: post.id,
        userId: session.user.id,
      });
    } catch (error) {
      // Revert on error
      setOptimisticLiked(null);
      setOptimisticCount(null);
      console.error("Failed to update like:", error);
    }
  };

  return (
    <>
      <div
        onClick={handleLikeClick}
        className="flex flex-row items-center group restrict-click"
      >
        <motion.span
          className={`rounded-full p-2 cursor-pointer h-8 w-8
            ${
              hasLiked
                ? "fill-pink-600 dark:fill-pink-600"
                : "fill-gray-600 dark:fill-gray-500 group-hover:fill-pink-600 group-hover:bg-pink-600/10"
            }`}
          animate={
            hasLiked
              ? {
                  scale: [1, 1.2, 1],
                }
              : {}
          }
          transition={{
            duration: 0.3,
            times: [0, 0.5, 1],
            type: "spring",
            stiffness: 400,
          }}
        >
          {hasLiked ? <HeartIconActive /> : <HeartIcon />}
        </motion.span>

        {likeCount > 0 && (
          <motion.span
            className={`text-sm -ml-1 ${
              hasLiked
                ? "text-pink-600"
                : "text-neutral-500 group-hover:text-pink-600"
            }`}
            animate={
              hasLiked
                ? {
                    scale: [1, 1.2, 1],
                  }
                : {}
            }
            transition={{
              duration: 0.3,
              times: [0, 0.5, 1],
            }}
          >
            {likeCount}
          </motion.span>
        )}
      </div>

      {showAuthDialog && (
        <AuthDialog
          dialogActionText="Login to show your love!"
          isOpen={showAuthDialog}
          onClose={() => setShowAuthDialog(false)}
        />
      )}
    </>
  );
};

export default LikeButton;
