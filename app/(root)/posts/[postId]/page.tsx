import { TweetHeader } from "@/components/header/tweet-header";
import { getTweetMetadata } from "@/components/tweets/api/getTweetMetadata";
import TweetDetails from "@/components/tweets/tweet-details";

interface PageProps {
  params: Promise<{
    postId: string;
  }>;
}

const page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const initialTweet = await getTweetMetadata({
    tweet_id: resolvedParams.postId,
  });

  return (
    <>
      <div className="pb-10 border-x border-gray-800">
        <TweetHeader />
        <TweetDetails initialTweet={initialTweet as any} />
      </div>
    </>
  );
};

export default page;

export const metadata = {
  title: "Post",
};
