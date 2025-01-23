import ProfileHeader from "@/components/header/profile-header";
import { getUserMetadata } from "@/components/profile/api/get-user-metadata";
import Profile from "@/components/profile/profile";
import ProfileTweetsAndReplies from "@/components/profile/profile-tweets-and-replies";
import { Metadata } from "next";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>,
}): Promise<Metadata> {
  const resolvedParams = await params;
  const user = await getUserMetadata({
    user_id: resolvedParams.userId,
    type: "tweets",
  });

  if (!user) {
    return { title: "User not found" };
  }

  return {
    title: `${user.name} (@${user.username})`,
  };
}

const page = async ({ 
  params 
}: { 
  params: Promise<{ userId: string }> 
}) => {
  const resolvedParams = await params;
  const user = await getUserMetadata({
    user_id: resolvedParams.userId,
    type: "tweets",
  });

  return (
    <>
      <ProfileHeader
        heading={user?.name ?? undefined}
        stats={`${user?._count?.posts} ${
          user?._count?.posts === 1 ? "post" : "posts"
        }`}
      />
      <Profile initialUser={user as any} />
      <ProfileTweetsAndReplies user={user as any}/>
    </>
  );
};

export default page;