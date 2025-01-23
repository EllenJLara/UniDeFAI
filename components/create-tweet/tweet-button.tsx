import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import CreateAgent from "../create-agent/create-agent";
import { useSession } from "next-auth/react";

interface TweetButtonProps {
  isMobile?: boolean;
  isDemo?: boolean;
}

export const RobotIcon = () => (
  <svg
    viewBox="0 0 512 512"
    width="24"
    height="24"
    fill="none"
    stroke="black"
    strokeWidth="25"
  >
    <path d="M424.464,226.038h-31.289c-4.637,0-8.394,3.758-8.394,8.394v17.485H370.51v-17.485c0-4.636-3.757-8.394-8.394-8.394 h-34.743v-17.351h34.743c4.637,0,8.394-3.758,8.394-8.394V66.121c0-20.285-16.502-36.787-36.787-36.787h-69.329V8.394 c0-4.636-3.757-8.394-8.394-8.394c-4.637,0-8.394,3.758-8.394,8.394v20.939h-69.33c-20.285,0-36.787,16.503-36.787,36.787v134.173 c0,4.636,3.757,8.394,8.394,8.394h34.744v17.351h-34.744c-4.637,0-8.394,3.758-8.394,8.394v17.485h-14.271v-17.485 c0-4.636-3.757-8.394-8.394-8.394h-31.29c-4.637,0-8.394,3.758-8.394,8.394v169.096c0,4.636,3.757,8.394,8.394,8.394h31.289 c4.637,0,8.394-3.758,8.394-8.394V303.215h14.271v68.203c0,4.636,3.757,8.394,8.394,8.394h14.9v75.713h-10.586 c-4.637,0-8.394,3.758-8.394,8.394v39.686c0,4.636,3.757,8.394,8.394,8.394h70.744c4.637,0,8.394-3.758,8.394-8.394v-39.686 c0-4.636-3.757-8.394-8.394-8.394h-10.585v-75.713h83.289v75.713h-10.586c-4.637,0-8.394,3.758-8.394,8.394v39.686 c0,4.636,3.757,8.394,8.394,8.394h70.744c4.637,0,8.394-3.758,8.394-8.394v-39.686c0-4.636-3.757-8.394-8.394-8.394h-10.585 v-75.713h14.9c4.637,0,8.394-3.758,8.394-8.394v-68.203h14.271v100.312c0,4.636,3.757,8.394,8.394,8.394h31.289 c4.637,0,8.394-3.758,8.394-8.394V234.431C432.857,229.796,429.1,226.038,424.464,226.038z" />
    <path d="M204.236,84.744c-20.803,0-37.727,16.924-37.727,37.726c0,20.802,16.924,37.726,37.727,37.726 c20.802,0.001,37.726-16.923,37.726-37.726C241.963,101.668,225.039,84.744,204.236,84.744z M204.236,143.409 c-11.545,0-20.94-9.392-20.94-20.939c0-11.545,9.394-20.939,20.94-20.939c11.545,0,20.939,9.393,20.939,20.939 C225.175,134.016,215.782,143.409,204.236,143.409z" />
    <path d="M307.765,84.744c-20.803,0-37.727,16.924-37.727,37.726c0,20.802,16.924,37.727,37.727,37.727 c20.802,0,37.726-16.924,37.726-37.726S328.567,84.744,307.765,84.744z M307.765,143.409c-11.545,0-20.94-9.393-20.94-20.939 c0-11.545,9.393-20.939,20.94-20.939c11.545,0,20.939,9.393,20.939,20.939C328.703,134.016,319.31,143.409,307.765,143.409z" />
    <path d="M256.001,270.9c-30.317,0-54.982,24.664-54.982,54.982c0,4.636,3.757,8.394,8.394,8.394h93.176 c4.637,0,8.394-3.758,8.394-8.394C310.982,295.565,286.318,270.9,256.001,270.9z" />
    <circle cx="326.744" cy="267.215" r="8.394" />
    <circle cx="185.257" cy="267.215" r="8.394" />
  </svg>
);

const TweetButton: React.FC<TweetButtonProps> = ({ isMobile = false, isDemo = false }) => {
  const [open, setOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  
  if (!session && !isDemo) return null;

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 700);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.button
          onClick={handleClick}
          whileTap={{ scale: 0.95 }}
          className={
            isMobile
              ? "group grid cursor-pointer place-items-center p-[0.315rem]"
              : "mt-10 max-w-[234px] xxl:w-full group"
          }
        >
          <div
            className={
              isMobile
                ? "bg-white flex items-center justify-center w-10 h-10 rounded-lg shadow-sm transition-colors duration-200 ease-in-out group-hover:bg-gray-50"
                : `w-[90%] flex justify-center bg-white rounded-lg p-[0.7em] shadow-[6px_6px_0px_0px_rgba(254,254,254,0.25)] border-2 border-gray`
            }
          >
            <span
              className={`flex items-center h-6 w-6 ${
                isMobile ? "fill-black" : "fill-black xxl:hidden"
              }`}
            >
              <RobotIcon />
            </span>
            {!isMobile && (
              <span className="hidden text-base xxl:inline font-bold text-black relative z-10">
                Create AI Agent
              </span>
            )}
          </div>
        </motion.button>
      </DialogTrigger>

{!isDemo &&       <DialogContent
        ref={contentRef}
        className="
    fixed
    top-1/2
    left-1/2
    -translate-x-1/2
    -translate-y-1/2
    sm:max-w-[600px]
    w-[90vw]
    max-h-[80vh]
    bg-black 
    light:bg-gray 
    p-0 
    overflow-y-auto
    rounded-lg
  "
      >
        <DialogTitle className="sr-only">Create post</DialogTitle>
        <div className="border-b border-gray-200 light:border-gray-800 sticky top-0 bg-black light:bg-gray z-10">
          <div className="relative h-12 px-4">
            <DialogClose
              tabIndex={-1}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800"
            >
              <X className="h-4 w-4 text-gray dark:text-white" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </div>
        <div className="overflow-y-auto h-full">
          <CreateAgent onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>}
    </Dialog>
  );
};

export default TweetButton;
