import { cn } from "@/lib/utils";
import React, { FC } from "react";

interface IHeader extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const Header: FC<IHeader> = ({ children, className }) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex items-center bg-background/90 font-bold text-secondary-100 backdrop-blur-sm sm:gap-5 gap-10",
        "px-4 py-4 mb-1 text-xl sm:text-xl border-b border-gray-700",
        "w-full", // Make it fill the container width
        className
      )}
    >
      {children}
    </header>
  );
};