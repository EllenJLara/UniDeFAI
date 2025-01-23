import React, { useState } from "react";
import NavItem from "./navbar-item";
import { Home, HomeActive } from "./assets/home-icon";
import { usePathname } from "next/navigation";
import { Search, SearchActive } from "./assets/search-icon";
import { useSession } from "next-auth/react";
import { ChatBubbleLeftRightIcon as ChatOutline } from "@heroicons/react/24/outline";
import { ChatBubbleLeftRightIcon as ChatSolid } from "@heroicons/react/24/solid";
import { UserActive, User } from "./assets/user-icon";
import AuthDialog from "../dialogs/auth-dialog";
import { AUTH_DIALOG_ACTION } from "../dialogs/aut-dialog.types";
import TweetButton from "../create-tweet/tweet-button";

const MobileNavbar = () => {
  const pathname = usePathname();
  const path = pathname?.split("/")[1];
  const { data: session }: any = useSession();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!session?.user?.id) {
      e.preventDefault();
      setShowAuthDialog(true);
    }
  };

  return (
    <>
      <nav
        className="fixed bottom-0 z-50 bg-background grid w-full grid-flow-col place-items-center border-t sm:hidden py-4"
        aria-label="Primary"
      >
        <NavItem
          href="/home"
          icon={pathname === "/home" ? <HomeActive /> : <Home />}
          text="Home"
        />
        <NavItem
          href="/explore"
          icon={pathname === "/explore" ? <SearchActive /> : <Search />}
          text="Explore"
        />
        <TweetButton isMobile={true} />
        <NavItem
          href="/chat"
          icon={pathname === "/chat" ? 
            <ChatSolid className="w-6 h-6" /> : 
            <ChatOutline className="w-6 h-6" />
          }
          text="Chat"
        />
        <NavItem
          href={`/profile/${session?.user?.id || "#"}`}
          onClick={handleProfileClick}
          icon={path === "profile" ? <UserActive /> : <User />}
          text="Profile"
        />
      </nav>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        dialogActionText={AUTH_DIALOG_ACTION.PROFILE_CLICK}
      />
    </>
  );
};

export default MobileNavbar;