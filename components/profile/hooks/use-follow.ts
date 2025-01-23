import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser } from "../api/follow-user";
import { unfollowUser } from "../api/unfollow-user";
import { useState } from "react";
import { useSession } from "next-auth/react";

export const useFollow = (
  type: "follow" | "unfollow",
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { data: session } = useSession();
  
  const sessionUserId = session?.user?.id || session?.user?.id;

  const mutation = useMutation({
    mutationFn: ({ user_id }: { user_id: string }) => {
      if (!sessionUserId) {
        setShowAuthDialog(true);
        return Promise.resolve();
      }
      return type === "follow"
        ? followUser(user_id, sessionUserId)
        : unfollowUser(user_id, sessionUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (onSuccess) {
        onSuccess();
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["people-to-follow"] });
    },
  });

  return {
    mutation,
    showAuthDialog,
    setShowAuthDialog,
  };
};