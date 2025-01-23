import React from "react";
import Image from "next/image";
import UniDeFAILogo from "@/assets/unidefai-logo.png";

const LoadingScreen = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-50 flex justify-center items-center">
      <span className="flex justify-center items-center">
        <Image
          src={UniDeFAILogo}
          alt="UniDeFAI Logo"
          layout="intrinsic" 
          className="sm:w-20 md:w-32 lg:w-40 w-16" 
        />
      </span>
    </div>
  );
};

export default LoadingScreen;
