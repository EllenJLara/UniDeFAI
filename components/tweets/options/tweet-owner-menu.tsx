import { DotIcon } from "@/assets/dot-icon";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MenuItem from "@/components/elements/menu/menu-item";
import { PinItem } from "@/assets/pin-icon";
import { TrashIcon } from "@/assets/trash-icon";
import { ITweet } from "../types";
import { usePinnedTweet } from "../hooks/use-pinned-tweet";

import { useSession } from "next-auth/react";
import { useUser } from "@/components/profile/hooks/use-user";
import { HighlightIcon } from "@/assets/highlight-icon";
import { CommentIcon } from "@/assets/comment-icon";
import { EngagementsIcon } from "@/assets/engagements-icon";
import { useDeleteTweet } from "../hooks/use-delete-tweet";

const TweetOwnerMenu = ({ tweet, pinned }: { tweet: ITweet, pinned: any }) => {
  const pinMutation = usePinnedTweet();
  const deleteMutation = useDeleteTweet();
  
  const { data: session }: any = useSession();
  const { data: user } = useUser({ id: session?.user?.id });

  const deleteTweet = async () => {
    if (!session?.user?.id) return;

    try {
      await deleteMutation.mutateAsync({
        tweetId: tweet?.id,
        userId: session?.user?.id,
        pinned:pinned,
      });

      // Optional: Handle the unpinning logic if tweet is pinned
      if (pinned) {
        pinMutation.mutate({
          userId: session?.user?.id,
          action: "unpin",
        });
      }

    } catch (error) {
      console.error("Error deleting tweet:", error);
    }
  };

  if (!session?.user?.id) {
    return null; // If the user is not logged in, don't render the menu
  }

  return (
    <div className="flex flex-row items-center space-x-1 group">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="rounded-full border-none focus-visible:border-none hover:border-none focus:border-none fill-gray-600 p-2 dark:fill-gray-500 cursor-pointer group-hover:fill-blue-400 
        transition-colors duration-200 ease-in-out 
        group-hover:bg-blue-400/10 
        h-8 w-8"
        >
          <DotIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={deleteTweet}>
            <MenuItem className="fill-secondary">
              <span className="h-5 w-5 fill-red-500 ">
                <TrashIcon />
              </span>{" "}
              <span className="text-red-500">Delete</span>
            </MenuItem>
          </DropdownMenuItem>

          {pinned ? (
            <DropdownMenuItem
              onClick={() => {
                pinMutation.mutate({
                  userId: session?.user?.id,
                  action: "unpin",
                });
              }}
            >
              <MenuItem className="fill-secondary">
                <span className="h-5 w-5 dark:fill-slate-300 fill-zinc-600">
                  <PinItem />
                </span>{" "}
                <span>Unpin</span>
              </MenuItem>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => {
                pinMutation.mutate({
                  tweetId: tweet.id,
                  userId: session?.user?.id,
                  action: "pin",
                });
              }}
            >
              <MenuItem className="fill-secondary">
                <span className="h-5 w-5 dark:fill-slate-300 fill-zinc-600">
                  <PinItem />
                </span>{" "}
                <span>Pin to your profile</span>
              </MenuItem>
            </DropdownMenuItem>
          )}

          {/* <DropdownMenuItem>
            <MenuItem onClick={() => {}} className="fill-secondary">
              <span className="h-5 w-5 dark:fill-slate-300 fill-zinc-600 ">
                <HighlightIcon />
              </span>{" "}
              <span>Highlight on your profile</span>
            </MenuItem>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <MenuItem onClick={() => {}} className="fill-secondary">
              <span className="h-5 w-5 dark:fill-slate-300 fill-zinc-600 ">
                <CommentIcon />
              </span>{" "}
              <span>Change who can reply</span>
            </MenuItem>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <MenuItem onClick={() => {}} className="fill-secondary">
              <span className="h-5 w-5 dark:fill-slate-300 fill-zinc-600">
                <EngagementsIcon />
              </span>{" "}
              <span>View post engagements</span>
            </MenuItem>
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TweetOwnerMenu;
