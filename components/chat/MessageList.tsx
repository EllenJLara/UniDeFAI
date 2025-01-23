// app/components/chat/MessageList.tsx
"use client"
import { useState, useRef } from 'react';
import { Message } from "@/components/useChat";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import Image from "next/image";
import { MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactionPicker } from "./ReactionPicker";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showHeader: boolean;
  isConsecutive: boolean;
  onDelete: (messageId: string) => Promise<void>;
  onToggleReaction: (messageId: string, emoji: string) => Promise<void>;
}

const MessageBubble = ({
  message,
  isOwn,
  showHeader,
  isConsecutive,
  onDelete,
  onToggleReaction,
}: MessageBubbleProps) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const groupedReactions = message.reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || []).concat(reaction);
    return acc;
  }, {} as Record<string, typeof message.reactions>);

  const MAX_VISIBLE_REACTIONS = 6;
  const sortedReactions = Object.entries(groupedReactions)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, MAX_VISIBLE_REACTIONS);
  const hasMoreReactions = Object.keys(groupedReactions).length > MAX_VISIBLE_REACTIONS;

  const renderContent = (content: MessageContent) => {
    switch (content.type) {
      case "TEXT":
        return (
          <p className="whitespace-pre-wrap break-words">
            {content.content}
          </p>
        );
      case "IMAGE":
        return (
          <div className="rounded-lg overflow-hidden max-w-[300px]">
            <Image
              src={content.mediaUrl!}
              alt="Shared image"
              width={300}
              height={200}
              className="object-cover w-full h-full"
            />
          </div>
        );
      case "SYSTEM":
        return (
          <p className="text-sm text-muted-foreground italic text-center">
            {content.content}
          </p>
        );
      default:
        return null;
    }
  };

  if (message.isSystem) {
    return (
      <div className="py-2 px-4 flex justify-center">
        <div className="bg-muted rounded-full px-4 py-1">
          {message.contents.map((content, idx) => (
            <div key={idx}>{renderContent(content)}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        flex 
        ${isOwn ? "flex-row-reverse" : "flex-row"} 
        gap-2
        ${isConsecutive ? "mt-1" : "mt-4"}
      `}
    >
      <div className="w-8 flex-shrink-0">
        {showHeader && !isOwn && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.sender.image} />
            <AvatarFallback>
              {message.sender.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div 
        className={`
          flex flex-col 
          ${isOwn ? "items-end" : "items-start"} 
          max-w-[70%]
          min-w-[100px]
          relative
        `}
      >
        {showHeader && (
          <div 
            className={`
              flex items-center gap-2 mb-1 px-1
              ${isOwn ? "flex-row-reverse" : "flex-row"}
            `}
          >
            <span className="text-sm font-medium">
              {message.sender.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(message.createdAt), "HH:mm")}
            </span>
          </div>
        )}

        <div 
          ref={bubbleRef}
          className={`
            relative 
            group
            ${isOwn ? "items-end" : "items-start"}
            ${isConsecutive ? "" : "mt-1"}
          `}
        >
          <div 
            className={`
              rounded-lg 
              ${isOwn 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
              }
              p-3 
              shadow-sm
              space-y-2
              ${isConsecutive && !isOwn ? 'rounded-tl-sm' : ''}
              ${isConsecutive && isOwn ? 'rounded-tr-sm' : ''}
              max-w-full
            `}
          >
            {message.contents.map((content, index) => (
              <div key={index}>{renderContent(content)}</div>
            ))}
          </div>

          <div 
            className={`
              absolute 
              ${isOwn ? "-left-16" : "-right-16"}
              top-0
              opacity-0 
              group-hover:opacity-100 
              transition-opacity
              flex 
              items-center 
              gap-1
              px-2
              py-1
              z-10
            `}
          >
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <span className="text-lg">😀</span>
            </button>

            {isOwn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-muted rounded transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isOwn ? "end" : "start"}>
                  <DropdownMenuItem 
                    className="text-destructive cursor-pointer"
                    onClick={() => onDelete(message.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {showReactionPicker && (
            <div 
              className={`
                absolute 
                ${isOwn ? "right-0" : "left-0"}
                bottom-full 
                mb-2
                z-50
              `}
            >
              <ReactionPicker
                onSelect={(emoji) => {
                  onToggleReaction(message.id, emoji);
                  setShowReactionPicker(false);
                }}
                onClose={() => setShowReactionPicker(false)}
              />
            </div>
          )}

          {sortedReactions.length > 0 && (
            <div 
              className={`
                flex flex-wrap gap-1 mt-2
                ${isOwn ? "justify-end" : "justify-start"}
                max-w-full
              `}
            >
              {sortedReactions.map(([emoji, reactions]) => (
                <button
                  key={emoji}
                  onClick={() => onToggleReaction(message.id, emoji)}
                  className={`
                    inline-flex items-center gap-1 
                    px-2 py-0.5 
                    rounded-full text-xs
                    ${reactions.some(r => r.userId === message.sender.id)
                      ? 'bg-primary/10 text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
                    }
                    transition-colors
                    whitespace-nowrap
                  `}
                  title={reactions.map(r => r.user.name).join(', ')}
                >
                  <span>{emoji}</span>
                  <span className="opacity-70">{reactions.length}</span>
                </button>
              ))}
              {hasMoreReactions && (
                <button
                  className="
                    px-2 py-0.5 
                    rounded-full text-xs
                    bg-muted/50 text-muted-foreground
                    hover:bg-muted/80
                    transition-colors
                  "
                >
                  +{Object.keys(groupedReactions).length - MAX_VISIBLE_REACTIONS}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-8 flex-shrink-0" />
    </div>
  );
};

interface MessageListProps {
  messages: Message[];
  onDeleteMessage: (messageId: string) => Promise<void>;
  onToggleReaction: (messageId: string, emoji: string) => Promise<void>;
}

const MessageList = ({
  messages,
  onDeleteMessage,
  onToggleReaction,
}: MessageListProps) => {
  const { data: session } = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isCurrentUser = (senderId: string) => {
    return session?.user?.id === senderId || localStorage.getItem("walletAddress") === senderId;
  };

  return (
    <div 
      ref={scrollRef}
      className="flex flex-col py-4 overflow-y-auto"
    >
      {messages.map((message, index) => {
        const isConsecutive = 
          index > 0 && 
          messages[index - 1].senderId === message.senderId &&
          new Date(message.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() < 60000;
        
        const showHeader =
          index === 0 || messages[index - 1].senderId !== message.senderId;

        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={isCurrentUser(message.senderId)}
            showHeader={showHeader}
            isConsecutive={isConsecutive}
            onDelete={onDeleteMessage}
            onToggleReaction={onToggleReaction}
          />
        );
      })}
    </div>
  );
};

export default MessageList;