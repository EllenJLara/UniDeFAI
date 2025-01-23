import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PostTweet } from "../api/post-tweet";
import { IChosenImages } from "../type";

interface TokenData {
  name: string;
  symbol: string;
  image: {
    thumb: string | null;
    small: string | null;
    large: string | null;
  };
}

export const useCreateTweet = ({
  setText,
  setChosenImages,
  setCryptoAddress,
  setTokenData,
  onSuccess,
}: {
  setText: (text: string) => void;
  setChosenImages: (chosenImages: IChosenImages[]) => void;
  setCryptoAddress: (cryptoAddress: string) => void;
  setTokenData: (tokenData: TokenData | null) => void;
  onSuccess?: () => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      text,
      userId,
      files,
      cryptoAddress,
      tokenData,
      in_reply_to_screen_name,
      in_reply_to_tweet_id,
    }: {
      text: string;
      userId: string;
      files: File[];
      cryptoAddress?: string | null;
      tokenData?: TokenData | null;
      in_reply_to_screen_name?: string | null;
      in_reply_to_tweet_id?: string | null;
    }) => {
      return PostTweet({
        text,
        userId,
        files,
        cryptoAddress,
        tokenData,
        in_reply_to_screen_name,
        in_reply_to_tweet_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tweets"] });
      queryClient.invalidateQueries({ queryKey: ["hashtags"] });
      queryClient.invalidateQueries({ queryKey: ["hashtags-dialog"] });
      onSuccess?.();
    },
    onError: (error) => {
      console.log("error", error);
    },
    onSettled: () => {
      setText("");
      setChosenImages([]);
      setCryptoAddress("");
      setTokenData(null);
    },
  });
};