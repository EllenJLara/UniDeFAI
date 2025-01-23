import { useState } from "react";
import { toast } from "react-hot-toast";
import { Share } from "lucide-react";
import posthog from "posthog-js";

const ShareButton = ({ tweet }) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    posthog.capture("post_interation", { action: "share_post" })
    if (!tweet?.id) {
      toast.error("Wait what? This tweet doesn't exist!");
      return;
    }

    try {
      setIsSharing(true);

      const shareUrl = `${window.location.origin}/posts/${tweet?.id}`;
      const shareText = `🔥 ${tweet?.body}\n\n Check out this ${tweet.tokenAddress} tweet on UniDeFAI!\n 🚀 ${shareUrl}\n #UniDeFAI #CryptoDegenVibes`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Check out this UniDeFAI tweet! 🚀",
            text: `🔥 ${tweet?.body}`,
            url: shareUrl,
          });
          toast.success("Shared with the fam! #CryptoDegenVibes");
          return;
        } catch (shareError) {
          if (shareError.name === "AbortError") {
            console.log("User cancelled sharing.");
            return;
          }
          console.warn(
            "Sharing failed. Falling back to clipboard copy.",
            shareError
          );
        }
      }

      await navigator.clipboard.writeText(shareText);
      toast.success("Link copied! Go spread the gospel of gains ✨");
    } catch (error) {
      console.error("Sharing failed:", error);
      toast.error("Oops, sharing failed. Blame the blockchain gremlins.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      onClick={isSharing ? undefined : handleShare}
      disabled={isSharing}
      className="flex flex-row items-center space-x-1 group restrict-click"
      aria-label="Share tweet"
    >
      <span
        className={`rounded-full p-2 
          group-hover:text-green-400 
          group-hover:bg-green-400/10
          transition-colors duration-200 ease-in-out 
          h-8 w-8 text-gray-600 dark:text-gray-500`}
      >
        <Share className="w-4 h-4" />
      </span>
    </button>
  );
};

export default ShareButton;
