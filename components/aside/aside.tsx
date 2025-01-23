import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import ChatNavigator from "../chat/ChatNavigator";
import { useMediaQuery } from "../tweets/hooks/use-media-query";

const colorMap = {
  blue: "bg-blue-500/20 text-blue-400",
  green: "bg-green-500/20 text-green-400",
  red: "bg-red-500/20 text-red-400",
  orange: "bg-orange-500/20 text-orange-400",
  pink: "bg-pink-500/20 text-pink-400",
};

const StepItem = ({ color, step, children, description }) => (
  <li className="flex items-start space-x-2.5 md:space-x-3 p-3 md:p-3 rounded-lg bg-gray-800 bg-opacity-50 hover:bg-opacity-70 transition-all duration-300">
    <span
      className={`inline-flex items-center justify-center w-6 h-6 md:w-6 md:h-6 rounded-full ${colorMap[color]} font-bold shrink-0 text-sm`}
    >
      {step}
    </span>
    <div className="text-gray-200">
      <span className="text-sm">{children}</span>
      {description && (
        <div className="mt-1 text-sm text-gray-400">
          You earn{" "}
          <span className="animate-pulse-shine font-bold bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 text-transparent bg-clip-text">
            50%
          </span>{" "}
          of trading fees every time someone makes a trade through your post!!
          💸
        </div>
      )}
    </div>
  </li>
);

const PopupContent = ({ onClose, show }) => {
  const steps = [
    { color: "blue", content: "Create insightful, informative, and engaging crypto contents 📚" },
    { color: "green", content: "Attach a coin to your post 💰" },
    { color: "red", content: "Upload your content to UniDeFAI 🚀" },
    {
      color: "orange",
      content: "People can view your post AND trade the token directly! 🔥",
    },
    {
      color: "pink",
      content: "More views = more trades = more $$$ 🤑🤑",
      description: true,
    },
  ];
  const styles = `
  @keyframes pulse-shine {
    0% {
      background-position: 200% center;
    }
    100% {
      background-position: -200% center;
    }
  }

  .animate-pulse-shine {
    animation: pulse-shine 3s linear infinite;
    background-size: 200% auto;
  }
`;
  return (
    <div
      className={`relative bg-gray-900 text-gray-100 p-3.5 md:p-4 rounded-xl w-full max-w-[360px] md:max-w-lg shadow-2xl border border-gray-800 mx-3 md:mx-4 max-h-[85vh] overflow-y-auto
      transition-all duration-500 transform
      ${show ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      onClick={(e) => e.stopPropagation()}
    >
      <style>{styles}</style>
      <button
        onClick={onClose}
        className="absolute right-2.5 top-2.5 md:right-3 md:top-3 p-1.5 md:p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>

      <div className="text-center mb-4 md:mb-5">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1.5 md:mb-2">
          How does this work?
        </h2>
        <p className="text-gray-400 text-sm">
          Follow these simple steps to get started
        </p>
      </div>

      <ul className="space-y-2.5 md:space-y-3">
        {steps.map((step, index) => (
          <StepItem
            key={index}
            color={step.color}
            step={index + 1}
            description={step.description}
          >
            {step.content}
          </StepItem>
        ))}
      </ul>

      <div className="mt-4 p-3 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700">
        <div className="flex items-center space-x-2 mb-1.5 md:mb-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 font-semibold text-sm">Example</span>
        </div>
        <p className="text-gray-300 text-sm">
          Post an insight and analysis about the ai16z project ➔ attach the $ai16z token ➔{" "}
          <span className="text-purple-400 font-semibold">
            combine social media and crypto!
          </span>
        </p>
      </div>

      <button
        className="mt-4 md:mt-5 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 md:py-3 px-4 rounded-lg text-sm font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
        onClick={onClose}
      >
        Make Your Pump Now! 🚀
      </button>
    </div>
  );
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const setCookie = (name, value, days) => {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/`;
};

const PopupAside = () => {
  const pathname = usePathname();
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const cookie = getCookie("hasVisited");
    if (!cookie) {
      setTimeout(() => {
        setIsVisible(true);
        setTimeout(() => setShowContent(true), 50);
      }, 743);
      setCookie("hasVisited", "true", 365);
    }
  }, []);

  const handleClose = () => {
    setShowContent(false);
    setTimeout(() => setIsVisible(false), 500);
  };

  // Early return if not on correct path
  if (pathname !== "/home" && !pathname.includes("/chat/")) {
    return null;
  }

  return (
    <>
      {isLargeScreen && <ChatNavigator />}

      {isVisible && (
        <div
          className={`fixed inset-0 flex justify-center items-center z-50 p-2 md:p-4
            transition-all duration-500
            ${showContent ? "bg-black/50 backdrop-blur-sm" : "bg-black/0"}`}
          onClick={handleClose}
        >
          <PopupContent onClose={handleClose} show={showContent} />
        </div>
      )}
    </>
  );
};

export default PopupAside;