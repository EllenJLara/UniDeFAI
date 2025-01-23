"use client";
import React from "react";
import { Header } from "../header/header";
import { useSession } from "next-auth/react";

const BookmarksHeader = () => {
  const { data: session }: any = useSession();
  return (
    <Header>
      <div className="flex flex-col gap-1">
        <span className="text-xl font-bold">Bookmarks</span>
        <div className="flex items-center">
          {session?.user?.username && (
            <span className="text-sm text-light-gray">
              @{session?.user?.username}
            </span>
          )}
        </div>
      </div>
    </Header>
  );
};

export default BookmarksHeader;