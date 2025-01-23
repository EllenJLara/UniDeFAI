import React from "react";
import CreateTweet from "./create-tweet";
import { getRandomPlaceholder } from "./utils/placeholder-generator";

const CreateTweetWrapper = ({
  in_reply_to_screen_name,
  in_reply_to_tweet_id,
}: {
  in_reply_to_screen_name: string | undefined;
  in_reply_to_tweet_id: string | null;
}) => {

  const comment_placeholder = getRandomPlaceholder('comment')
  return (
    <>
      <div>
        <CreateTweet
          placeholder={comment_placeholder}
          in_reply_to_screen_name={in_reply_to_screen_name}
          in_reply_to_tweet_id={in_reply_to_tweet_id}
        />
      </div>
    </>
  );
};

export default CreateTweetWrapper;
