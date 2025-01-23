import React from "react";
import Link from "next/link"; // Import the Link component
import CreateTweet from "@/components/create-tweet/create-tweet";

import { Header } from "@/components/header/header";
import { Tweets } from "@/components/tweets/tweets";
import ProfileButton from "@/components/home/profile-button";

const page = () => {
  return (
    <div className="mx-auto relative min-h-screen border-x border-gray-800">
      <Header>
        <ProfileButton />
        {/* Use Link with inline styling to ensure no position change */}
        <Link href="/home" className="p-1">
          <span className="cursor-pointer">Home</span>
        </Link>
      </Header>
      <CreateTweet />
      <Tweets />
    </div>
  );
};

export default page;

export const metadata = {
  title: "Home",
};
