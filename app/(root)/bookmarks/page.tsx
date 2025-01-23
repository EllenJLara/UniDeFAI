import Bookmarks from "@/components/bookmarks/bookmarks";
import BookmarksHeader from "@/components/bookmarks/bookmarks-header";
import React from "react";

const page = () => {
  return (
    <div className="mx-auto relative min-h-screen border-x border-gray-800">
      {" "}
      {/* Added padding top */}
      <BookmarksHeader />
      <main className="mt-2">
        {" "}
        {/* Added margin between header and content */}
        <Bookmarks />
      </main>
    </div>
  );
};

export default page;

export const metadata = {
  title: "Bookmarks",
};
