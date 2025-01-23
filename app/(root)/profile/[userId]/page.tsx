import ProfileHeader from "@/components/header/profile-header";
import { getUserMetadata } from "@/components/profile/api/get-user-metadata";
import Profile from "@/components/profile/profile";
import ProfileTweets from "@/components/profile/profile-tweets";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
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

const Page = async ({ params }: { params: Promise<{ userId: string }> }) => {
  const resolvedParams = await params;
  const user = await getUserMetadata({
    user_id: resolvedParams.userId,
    type: "tweets",
  });

  if (!user) return <p>NOT FOUND</p>;

  return (
    <>
      <div className="border-x border-gray-800">
        <ProfileHeader
          heading={user.name ?? undefined}
          stats={`${user?._count?.posts} ${
            user?._count?.posts === 1 ? "post" : "posts"
          }`}
        />
        <Profile initialUser={user as any} />
        <ProfileTweets user={user as any} />
      </div>
    </>
  );
};

export default Page;
