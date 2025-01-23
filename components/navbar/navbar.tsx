import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React from "react";
import NavItem from "./navbar-item";
import { Home, HomeActive } from "./assets/home-icon";
import { Search, SearchActive } from "./assets/search-icon";
import { Bell, BellActive } from "./assets/bell-icon";
import { Message, MessageActive } from "./assets/message-icon";
import { Bookmark, BookmarkActive } from "./assets/bookmark-icon";
import { User, UserActive } from "./assets/user-icon";

const Navbar = ({isDemo = false}) => {
  const pathname = usePathname();
  const path = pathname?.split("/")[1];
  const { data: session }: any = useSession();
  return (
    <div className="flex flex-col items-center  xxl:items-start">
      {/* {session && ( */}
        <NavItem
          href="/home"
          icon={pathname === "/home" ? <HomeActive /> : <Home />}
          text="[home]"
          isDemo={isDemo}
        />
      {/* // )} */}

      <NavItem
      
        href="/explore"
        icon={pathname === "/explore" ? <SearchActive /> : <Search />}
        text="[search]"
        isDemo={isDemo}
      />

      {/* {session && (
        <NavItem
          href="/notifications"
          icon={
            pathname === "/notifications"
              ? <BellActive/>
              : <Bell/>
          }
          text="Notifications"
        />
      )} */}

      {/* {session && (
        <NavItem
          href="/messages"
          icon={pathname === "/messages" ? <MessageActive /> : <Message />}
          text="Messages"
        />
      )} */}

      {/* {session && ( */}
        <NavItem
          href="/bookmarks"
          icon={pathname === "/bookmarks" ? <BookmarkActive /> : <Bookmark />}
          text="[saved]"
          isDemo={isDemo}
        />
      {/* )} */}

      {/* {session && ( */}
        <NavItem
          href={`/profile/${session?.user?.id}`}
          icon={path === "profile" ? <UserActive /> : <User />}
          text="[profile]"
          isDemo={isDemo}
        />
      {/* )} */}
    </div>
  );
};

export default Navbar;
