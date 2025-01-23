import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  isDemo?: boolean;
}

const NavItem: React.FC<NavLinkProps> = ({ href, icon, text, onClick, isDemo = false}) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      if (onClick) {
        onClick(e);
      }
  };

  return (
    <Link
      href={href}
      onClick={isDemo ? () => {} :handleClick}
      className="group grid cursor-pointer place-items-center p-[0.315rem] sm:px-0 sm:py-[0.25rem] xxl:justify-start"
    >
      <div className="flex p-[0.4em] items-center rounded-full outline-offset-2 justify-center transition-colors duration-200 ease-in-out group-hover:bg-gray-500/20 xxl:pr-7 sm:p-[0.6em]">
        <span className="fill-secondary-100 h-6 w-6 dark:fill-slate-100 ">
          {icon}
        </span>

        <span className="ml-3 hidden xxl:inline text-lg font-normal fun-text">
          {text}
        </span>
      </div>
    </Link>
  );
};

export default NavItem;