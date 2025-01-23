"use client";
import { useEffect, useCallback, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon } from "@/assets/image-icon";
import { Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "../profile/hooks/use-user";
import { useCreateTweet } from "./hooks/use-create-tweet";
import { resizeTextarea } from "./utils/resize-textarea";
import { chooseImages } from "./utils/choose-images";
import { getRandomPlaceholder } from "./utils/placeholder-generator";
import { getTokenDataStatus } from "@/services/tokenExists";
import ChosenImages from "./chosen-images";
import AuthDialog from "@/components/dialogs/auth-dialog";
import { AUTH_DIALOG_ACTION } from "../dialogs/aut-dialog.types";
import { Gift } from "lucide-react";
import GifSearch from "./add-gif";
import { GifIcon } from "@/assets/gif-icon";
import type { IChosenImages } from "./type/index";
import TokenSearch from "./token-search";
import toast from "react-hot-toast";

const MAX_TWEET_LENGTH = 1000;
const DEBOUNCE_DELAY = 500;

interface CreateTweetProps {
  placeholder?: string;
  in_reply_to_screen_name?: string | null;
  in_reply_to_tweet_id?: string | null;
  inputId?: string;
  onSuccess?: () => void;
}

interface TokenData {
  name: string;
  symbol: string;
  image: any;
}

type ValidationStatus = "idle" | "validating" | "invalid" | "valid";

const UserAvatar = ({ user, session }) => (
  <Avatar className="bg-center bg-cover h-9 w-9">
    <AvatarImage
      src={user?.image || "/images/user_placeholder.png"}
      alt={user?.name || "User"}
    />
    <AvatarFallback>{session?.user?.name?.[0] || "?"}</AvatarFallback>
  </Avatar>
);

const urlToFile = async (url: string): Promise<File> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], `gif-${Date.now()}.gif`, { type: "image/gif" });
};

export const CreateTweet = ({
  placeholder = getRandomPlaceholder("alpha"),
  in_reply_to_screen_name,
  in_reply_to_tweet_id,
  inputId = "tweet-text",
  onSuccess,
}: CreateTweetProps) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { data: user, isLoading: userLoading } = useUser({
    id: userId,
    enabled: !!userId,
  });

  const [text, setText] = useState("");
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [chosenImages, setChosenImages] = useState<IChosenImages[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [requireWalletConnect, setRequireWalletConnect] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [validationStatus, setValidationStatus] =
    useState<ValidationStatus>("idle");

  const [tokenData, setTokenData] = useState<TokenData | null>(null);

  const [showGifSearch, setShowGifSearch] = useState(false);
  const [showTokenSearch, setShowTokenSearch] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>();

  const mutation = useCreateTweet({
    setText,
    setChosenImages,
    setCryptoAddress,
    setTokenData,
    onSuccess,
  });

  useEffect(() => {
    if (textAreaRef.current) {
      resizeTextarea(textAreaRef.current);
    }
  }, [text]);

  const handleTokenValidation = useCallback(
    async (address: string): Promise<boolean> => {
      if (!address) {
        setValidationStatus("idle");
        setIsValidToken(null);
        return false;
      }

      setValidationStatus("validating");
      setIsValidToken(null);

      try {
        const { exists, name, symbol, image } = await getTokenDataStatus(
          address
        );
        setIsValidToken(exists);
        setValidationStatus(exists ? "valid" : "invalid");

        if (exists) {
          setTokenData({ name, symbol, image });
        }

        return exists;
      } catch (error) {
        console.error("Token validation error:", error);
        setIsValidToken(false);
        setValidationStatus("invalid");
        return false;
      }
    },
    []
  );
  const handleGifSelect = async (gifUrl: string) => {
    try {
      const response = await fetch(gifUrl);
      const blob = await response.blob();
      const file = new File([blob], `gif-${Date.now()}.gif`, {
        type: "image/gif",
      });

      // Create a local URL for preview
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setChosenImages((prev) => [
          ...prev,
          {
            url: reader.result,
            id: Math.random(),
            file: file,
            width: 400, // Default width for GIFs
            height: 300, // Default height for GIFs
          },
        ]);
      };

      setShowGifSearch(false);
    } catch (error) {
      console.error("Error processing GIF:", error);
    }
  };

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSubmit = useCallback(() => {
    const hasContent = text.length > 0 || chosenImages.length > 0;
    const isValidLength = text.length <= MAX_TWEET_LENGTH;

    if (!userId || !hasContent || !isValidLength) return;

    mutation.mutate({
      text: text.trim(),
      userId,
      files: chosenImages.map((img) => img.file),
      cryptoAddress,
      tokenData,
      in_reply_to_screen_name,
      in_reply_to_tweet_id,
    });
  }, [
    text,
    userId,
    chosenImages,
    cryptoAddress,
    tokenData,
    in_reply_to_screen_name,
    in_reply_to_tweet_id,
    mutation,
  ]);

  const shortenAddress = useCallback((address: string): string => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !popupRef.current?.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (userLoading) {
    return (
      <div className="h-full flex overflow-auto border-b py-3 px-4 gap-3">
        <div className="animate-pulse flex gap-3 w-full">
          <div className="rounded-full bg-gray-200 h-9 w-9" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const handleTokenSelect = async (address: string, tokenData: TokenData) => {
    if (tokenData?.name) {
      setCryptoAddress(address);
      setTokenData(tokenData);
      setShowTokenSearch(false);
    } else {
      toast.error("Token not supported. Please try another one.");
    }
  };

  return (
    <div className="h-full flex overflow-auto border-b py-3 px-4 gap-3 overflow-hidden">
      <div className="hidden md:block">
        <UserAvatar user={user} session={session} />
      </div>
      <form className="w-full" onSubmit={(e) => e.preventDefault()}>
        <div className="w-full space-y-3">
          {in_reply_to_screen_name && (
            <div className="text-sm text-zinc-800 dark:text-zinc-500">
              Replying to{" "}
              <span className="text-sky-500">@{in_reply_to_screen_name}</span>
            </div>
          )}

          <div className="overflow-x-hidden overflow-y-auto w-full max-h-[320px]">
            <Textarea
              id={inputId}
              ref={textAreaRef}
              placeholder={placeholder}
              value={text}
              style={{ height: "auto" }}
              className="border-none placeholder:text-light-gray px-0 h-0 resize-none shadow-none text-base focus:border-none focus:outline-none focus-visible:outline-none outline-none active:border-none focus-visible:border-none"
              onChange={(e) => setText(e.target.value)}
              maxLength={MAX_TWEET_LENGTH}
            />
          </div>

          {chosenImages.length > 0 && (
            <ChosenImages
              chosenImages={chosenImages}
              setChosenImages={setChosenImages}
            />
          )}

          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                type="button"
                variant="outline"
                className="p-2 h-[40px] w-[40px] outline-none border-none rounded-full justify-center flex items-center hover:bg-zinc-400/10 transition-colors duration-200 ease-in-out"
                onClick={
                  !userId ? () => setShowAuthDialog(true) : handleImageUpload
                }
                disabled={chosenImages.length >= 4}
              >
                <ImageIcon />
                <input
                  ref={fileInputRef}
                  className="hidden"
                  type="file"
                  onChange={(e) =>
                    chooseImages({
                      event: e,
                      setChosenImages,
                      chosenImagesLength: chosenImages.length,
                    })
                  }
                  accept="image/*, video/*"
                  multiple
                  max={4}
                />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="p-2 h-[40px] w-[40px] outline-none border-none rounded-full justify-center flex items-center hover:bg-zinc-400/10 transition-colors duration-200 ease-in-out"
                onClick={
                  !userId
                    ? () => setShowAuthDialog(true)
                    : () => setShowGifSearch(true)
                }
                disabled={chosenImages.length > 3}
              >
                <GifIcon />
              </Button>
              <GifSearch
                isOpen={showGifSearch}
                onClose={() => setShowGifSearch(false)}
                onSelect={handleGifSelect}
              />

              {!in_reply_to_tweet_id && (
                <div
                  className="relative"
                >
                  <Button
                    type="button"
                    ref={buttonRef}
                    onClick={() => {
                      if (!session?.user?.walletAddress) {
                        setShowAuthDialog(true);
                        setRequireWalletConnect(true);
                      } else {
                        setShowTokenSearch(true);
                      }
                    }}
                    variant="outline"
                    className="px-4 h-[40px] outline-none border-none rounded-full text-sm font-medium justify-center flex items-center hover:bg-zinc-400/10 transition-colors duration-200 ease-in-out fun-text"
                  >
                    [
                    {cryptoAddress
                      ? shortenAddress(cryptoAddress)
                      : "attach coin"}
                    ]
                  </Button>

                  <TokenSearch
                    isOpen={showTokenSearch}
                    onClose={() => setShowTokenSearch(false)}
                    onSelect={handleTokenSelect}
                  />
                </div>
              )}
            </motion.div>

            <Button
              type="button"
              disabled={
                (text.length === 0 || text.length > MAX_TWEET_LENGTH) &&
                chosenImages.length === 0
              }
              className="px-6 w-fit bg-white text-black font-semibold rounded transition-colors duration-200 hover:bg-white/75 disabled:opacity-50 disabled:opacity-50 disabled:hover:bg-white/90"
              onClick={!userId ? () => setShowAuthDialog(true) : handleSubmit}
            >
              {in_reply_to_tweet_id ? "Reply" : "Post"}
            </Button>
          </div>
        </div>
      </form>
      {(!userId || (userId && !session?.user?.walletAddress)) && (
        <AuthDialog
          isOpen={showAuthDialog}
          onClose={() => {
            setShowAuthDialog(false);
            setRequireWalletConnect(false);
          }}
          dialogActionText={
            placeholder.includes("reply")
              ? AUTH_DIALOG_ACTION.COMMENT
              : AUTH_DIALOG_ACTION.POST
          }
          onlyWallet={requireWalletConnect}
        />
      )}
    </div>
  );
};

export default CreateTweet;
