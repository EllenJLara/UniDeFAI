import { useFollow } from "@/components/profile/hooks/use-follow";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import AuthDialog from "@/components/dialogs/auth-dialog";
import { AUTH_DIALOG_ACTION } from "@/components/dialogs/aut-dialog.types";

const FollowButton = ({
  user_id,
  username,
  session_owner_id,
  isFollowing = false,
}: {
  username?: string | undefined;
  user_id: string;
  session_owner_id: string;
  isFollowing?: boolean;
}) => {
  const { data: session } = useSession();
  const {
    mutation: followMutation,
    showAuthDialog,
    setShowAuthDialog,
  } = useFollow("follow");
  const { mutation: unfollowMutation } = useFollow("unfollow");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFollow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (user_id === session?.user?.id) {
      setErrorMessage("You cannot follow yourself");
      return;
    }

    if (isFollowing) {
      unfollowMutation.mutate({ user_id, session_owner_id });
    } else {
      followMutation.mutate({ user_id, session_owner_id });
    }
  };

  return (
    <>
      <Button
        className={`w-fit px-4 transition-all ${
          isFollowing
            ? "bg-grey-900"
            : "default" 
        }`}
        variant={isFollowing ? "outline" : "default"}
        onClick={handleFollow}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
        onMouseEnter={(e) => {
          e.currentTarget.textContent = isFollowing ? "Unfollow" : "Follow";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.textContent = isFollowing ? "Following" : "Follow";
        }}
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        dialogActionText={AUTH_DIALOG_ACTION.FOLLOW}
      />
    </>
  );
};

export default FollowButton;
