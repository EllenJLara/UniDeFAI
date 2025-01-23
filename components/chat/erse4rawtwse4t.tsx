// import { useState } from "react";
// import { Message, MessageContent } from "@/components/useChat";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { format } from "date-fns";
// import Image from "next/image";
// import { MoreHorizontal, Trash2 } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { ReactionPicker } from "./ReactionPicker";
// interface MessageBubbleProps {
//   message: Message;
//   isOwn: boolean;
//   showHeader: boolean;
//   onDelete: (messageId: string) => Promise<void>;
//   onToggleReaction: (messageId: string, emoji: string) => Promise<void>;
// }

// export const MessageBubble = ({
//   message,
//   isOwn,
//   showHeader,
//   onDelete,
//   onToggleReaction,
// }: MessageBubbleProps) => {
//   const [showReactionPicker, setShowReactionPicker] = useState(false);

//   const renderContent = (content: MessageContent) => {
//     switch (content.type) {
//       case "TEXT":
//         return (
//           <p className="whitespace-pre-wrap break-words">{content.content}</p>
//         );
//       case "IMAGE":
//         return (
//           <div className="relative rounded-lg overflow-hidden">
//             <Image
//               src={content.mediaUrl!}
//               alt="Shared image"
//               width={300}
//               height={200}
//               className="object-cover"
//             />
//           </div>
//         );
//       case "SYSTEM":
//         return (
//           <p className="text-sm text-gray-500 italic text-center">
//             {content.content}
//           </p>
//         );
//       default:
//         return null;
//     }
//   };

//   if (message.isSystem) {
//     return (
//       <div className="py-2">
//         {message.contents.map((content) => renderContent(content))}
//       </div>
//     );
//   }

//   return (
//     <div className={`flex ${isOwn ? "flex-row-reverse" : "flex-row"} gap-2`}>
//       {showHeader && !isOwn && (
//         <Avatar className="h-8 w-8 mt-1">
//           <AvatarImage src={message.sender.image} />
//           <AvatarFallback>
//             {message.sender.name[0].toUpperCase()}
//           </AvatarFallback>
//         </Avatar>
//       )}

//       <div
//         className={`flex flex-col ${
//           isOwn ? "items-end" : "items-start"
//         } max-w-[70%]`}
//       >
//         {showHeader && (
//           <div
//             className={`flex items-center gap-2 mb-1 ${
//               isOwn ? "flex-row-reverse" : "flex-row"
//             }`}
//           >
//             <span className="font-semibold text-sm">{message.sender.name}</span>
//             <span className="text-xs text-gray-500">
//               {format(new Date(message.createdAt), "HH:mm")}
//             </span>
//           </div>
//         )}

//         <div
//           className={`relative group ${isOwn ? "items-end" : "items-start"}`}
//         >
//           <div
//             className={`
//               rounded-lg 
//               ${isOwn ? "bg-white text-black" : "bg-gray-100 dark:bg-zinc-800"}
//               p-3 
//               shadow-sm
//               space-y-2
//             `}
//           >
//             {message.contents.map((content, index) => (
//               <div key={index}>{renderContent(content)}</div>
//             ))}
//           </div>

//           {/* Message Actions */}
//           <div
//             className={`
//               absolute 
//               ${isOwn ? "left-0" : "right-0"} 
//               top-0
//               opacity-0 
//               group-hover:opacity-100 
//               transition-opacity
//               -translate-x-full
//               ${isOwn ? "-translate-x-2" : "translate-x-2"}
//               flex 
//               items-center 
//               gap-1
//             `}
//           >
//             {/* Reaction Button */}
//             <button
//               onClick={() => setShowReactionPicker(!showReactionPicker)}
//               className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full"
//             >
//               <span className="text-xl">😀</span>
//             </button>

//             {/* Message Menu */}
//             {isOwn && (
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <button className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full">
//                     <MoreHorizontal className="h-4 w-4" />
//                   </button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent>
//                   <DropdownMenuItem
//                     className="text-red-500 cursor-pointer"
//                     onClick={() => onDelete(message.id)}
//                   >
//                     <Trash2 className="h-4 w-4 mr-2" />
//                     Delete
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             )}
//           </div>

//           {showReactionPicker && (
//             <div
//               className={`
//     absolute 
//     ${isOwn ? "right-0" : "left-0"}
//     bottom-full 
//     mb-2
//     z-50
//   `}
//             >
//               <ReactionPicker
//                 onSelect={(emoji) => {
//                   onToggleReaction(message.id, emoji);
//                   setShowReactionPicker(false);
//                 }}
//                 onClose={() => setShowReactionPicker(false)}
//               />
//             </div>
//           )}

//           {message.reactions.length > 0 && (
//             <div
//               className={`
//                 flex 
//                 flex-wrap 
//                 gap-1 
//                 mt-1
//                 ${isOwn ? "justify-end" : "justify-start"}
//               `}
//             >
//               {Object.entries(
//                 message.reactions.reduce((acc, reaction) => {
//                   acc[reaction.emoji] = (acc[reaction.emoji] || []).concat(
//                     reaction
//                   );
//                   return acc;
//                 }, {} as Record<string, typeof message.reactions>)
//               ).map(([emoji, reactions]) => (
//                 <button
//                   key={emoji}
//                   onClick={() => onToggleReaction(message.id, emoji)}
//                   className={`
//                     flex 
//                     items-center 
//                     gap-1 
//                     px-2 
//                     py-1 
//                     rounded-full 
//                     text-sm
//                     ${
//                       reactions.some((r) => r.userId === message.sender.id)
//                         ? "bg-blue-100 dark:bg-blue-900"
//                         : "bg-gray-100 dark:bg-zinc-800"
//                     }
//                     hover:bg-gray-200 dark:hover:bg-zinc-700
//                     transition-colors
//                   `}
//                 >
//                   <span>{emoji}</span>
//                   <span className="text-xs text-gray-500">
//                     {reactions.length}
//                   </span>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

import React from 'react';

interface MessageProps {
  message: {
    id: string;
    text: string;
    sender: {
      id: string;
      name: string;
    };
    reactions: { userId: string; emoji: string }[];
  };
  isOwn: boolean;
  isConsecutive: boolean;
  onToggleReaction: (messageId: string, emoji: string) => void;
}

const Message: React.FC<MessageProps> = ({ message, isOwn, isConsecutive, onToggleReaction }) => {
  const reactions = message.reactions;

  return (
    <div
      className={`
        flex 
        ${isOwn ? "flex-row-reverse" : "flex-row"} 
        gap-2
        ${isConsecutive ? "mt-1" : "mt-4"}
      `}
    >
      <div
        className={`
          rounded-lg 
          ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground'}
          p-3 
          shadow-sm
          space-y-2
          ${isConsecutive && !isOwn ? 'rounded-tl-sm' : ''}
          ${isConsecutive && isOwn ? 'rounded-tr-sm' : ''}
          transition-colors duration-200
        `}
      >
        <p>{message.text}</p>
        <div className="flex flex-wrap gap-1">
          {reactions.map((reaction) => (
            <span key={reaction.emoji} className="text-sm">
              {reaction.emoji}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {reactions.map((reaction) => (
          <button
            key={reaction.emoji}
            onClick={() => onToggleReaction(message.id, reaction.emoji)}
            className={`
              inline-flex items-center gap-1 
              px-2 py-1 
              rounded-full text-sm
              ${reactions.some(r => r.userId === message.sender.id)
                ? 'bg-primary/20 text-primary-foreground'
                : 'bg-muted text-muted-foreground'
              }
              hover:bg-primary/30
              transition-colors duration-200
              max-w-[150px]
            `}
          >
            {reaction.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Message;


