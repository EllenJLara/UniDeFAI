import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotIcon } from "@/assets/dot-icon";
import MenuItem from "@/components/elements/menu/menu-item";
import { ITweet } from "../types";
import { FollowIcon } from "@/assets/follow-icon";
import { UnfollowIcon } from "@/assets/unfollow-icon";
import { useFollow } from "@/components/profile/hooks/use-follow";
import { useSession } from "next-auth/react";
import { checkFollowing } from "../api/check-following";
import { useToast } from "@/components/ui/use-toast";

const TweetVisitorMenu = ({ tweet }: { tweet: ITweet }) => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const {
    mutation: followMutation,
    showAuthDialog,
    setShowAuthDialog,
  } = useFollow("follow");
  const { mutation: unfollowMutation } = useFollow("unfollow");
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleDropdownOpen = async (open: boolean) => {
    setIsOpen(open);
    if (open && isFollowing === null && session?.user?.id && tweet.userId) {
      const status = await checkFollowing(session.user.id, tweet.userId);
      setIsFollowing(status);
    }
  };

  const handleFollow = () => {
    setIsOpen(false); // Close menu immediately

    const wasFollowing = isFollowing;
    if (wasFollowing) {
      unfollowMutation.mutate({ user_id: tweet.userId });
      toast({
        description: `Unfollowed @${tweet.user.username}`,
        duration: 2000,
        className: "bg-purple-500 text-white border-none",
      });
    } else {
      followMutation.mutate({ user_id: tweet.userId });
      toast({
        description: `Followed @${tweet.user.username}`,
        duration: 2000,
        className: "bg-purple-500 text-white border-none",
      });
    }
    setIsFollowing(!wasFollowing);
  };

  return (
    <>
      <div className="flex flex-row items-center space-x-1 group">
        <DropdownMenu open={isOpen} onOpenChange={handleDropdownOpen}>
          <DropdownMenuTrigger
            className="rounded-full border-none focus-visible:border-none hover:border-none focus:border-none fill-gray-600 p-2 dark:fill-gray-500 cursor-pointer group-hover:fill-purple-400 
            transition-colors duration-200 ease-in-out 
            group-hover:bg-blue-400/10 
            h-8 w-8"
          >
            <DotIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="focus:bg-transparent hover:bg-transparent p-0">
              <MenuItem
                onClick={handleFollow}
                className="fill-secondary w-full hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-3"
              >
                <span className="h-5 w-5 dark:fill-slate-300 fill-zinc-600">
                  {isFollowing ? <UnfollowIcon /> : <FollowIcon />}
                </span>{" "}
                <span>
                  {isFollowing === null
                    ? "Loading..."
                    : isFollowing
                    ? `unfollow @${tweet.user.username}`
                    : `follow @${tweet.user.username}`}
                </span>
              </MenuItem>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export default TweetVisitorMenu;
