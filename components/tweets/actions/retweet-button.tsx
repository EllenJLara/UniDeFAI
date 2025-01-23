import { RetweetIcon } from "@/assets/retweet-icon";
import axios from "axios";
import { Repeat2 } from "lucide-react";

const RetweetButton = () => {
  const handleRetweet = async () => {
    try {
      // const response = await axios.post('/api/retweet', { user_id, tweet_id });
      // if (response.data.status === 'success') {
      //   alert('Retweeted successfully!');
      // }
    } catch (error) {
      console.error('Error retweeting:', error);
    }
  };
  return (
    <div className="flex flex-row items-center space-x-1 group restrict-click" onClick={handleRetweet}>
      <span
        className={` rounded-full p-2 fill-gray-600 dark:fill-gray-500 cursor-pointer   group-hover:fill-green-500 
        transition-colors duration-200 ease-in-out 
        group-hover:bg-green-500/10
         h-8 w-8
         restrict-click
      `}
      >
        <RetweetIcon   />
      </span>
    </div>
  );
};

export default RetweetButton;
