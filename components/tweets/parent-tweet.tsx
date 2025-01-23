import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Tweet from "./tweet";

const ParentTweet = ({ tweet, isFirst, isLast }) => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleTweetClick = (e) => {
    if (
      e.target.closest("a") ||
      e.target.closest("button")
    ) {
      return;
    }
    router.push(`/posts/${tweet.id}`);
  };

  return (
    <div className="relative group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50">
      <div className="absolute -left-2 top-0 bottom-0 w-12 flex justify-center">
        <div
          className={`w-0.5 bg-gradient-to-b from-blue-400 via-purple-500 to-blue-400 
            opacity-60 group-hover:opacity-100 transition-all duration-300
            shadow-[0_0_8px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_12px_rgba(59,130,246,0.7)]
            absolute rounded-full 
            ${isFirst ? "top-14" : "-top-2"}
            ${isLast ? "bottom-1" : "-bottom-2"}
            before:content-[''] before:absolute before:inset-0
            before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent
            before:animate-shimmer`}
        />
        <div 
          className={`absolute w-6 h-0.5 top-14
            bg-gradient-to-r from-blue-400 to-purple-500
            opacity-60 group-hover:opacity-100 transition-all duration-300
            shadow-[0_0_8px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_12px_rgba(59,130,246,0.7)]
            rounded-full animate-pulse`}
        />
      </div>
      <div className="" onClick={handleTweetClick}>
        <Tweet replyChainParent={true} tweet={tweet} />
      </div>
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ParentTweet;