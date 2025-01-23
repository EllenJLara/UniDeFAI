"use client";
// app/components/chat/ChatContainer.tsx
import React, { useRef, useEffect, useState, useCallback, Suspense } from "react";
import { useInView } from "react-intersection-observer";
import { useChat } from "@/components/useChat";
import { useGroup } from "@/components/useGroup";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import TypingIndicator from "./TypingIndicator";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageSquarePlus, Users } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useMediaQuery } from "../tweets/hooks/use-media-query";
import { 
  ChatHeaderSkeleton, 
  MessageListSkeleton 
} from "./skeletons/ChatSkeletons";

interface ChatContainerProps {
  groupId: string;
}

const ChatContainer = ({ groupId }: ChatContainerProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { ref: loadMoreRef, inView } = useInView();
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    hasMore,
    loadingMore,
    typingUsers,
    sendMessage,
    deleteMessage,
    toggleReaction,
    sendTypingIndicator,
    loadMore,
  } = useChat(groupId);

  const {
    group,
    members,
    loading: groupLoading,
    error: groupError,
    loadGroup,
  } = useGroup(groupId);

  const isMember = group?.members?.some(
    (member) => member.userId === session?.user?.id
  );

  const joinMutation = useMutation({
    mutationFn: async (groupId: string) => {
      if (!session?.user?.id) return;
      await axios.post(`/api/chat/groups/${groupId}/members`, {
        userIds: [session.user.id],
      });
    },
    onSuccess: async () => {
      await loadGroup();
      queryClient.invalidateQueries({ queryKey: ["chat-groups"] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) return;
      const isLastMember = members.length === 1;

      if (isLastMember) {
        await axios.delete(`/api/chat/groups/${groupId}`);
      } else {
        await axios.delete(
          `/api/chat/groups/${groupId}/members/${session.user.id}`
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-groups"] });
      if (isMobile || isTablet) router.replace("/chat");
    },
    onError: (error) => {
      console.error("Error leaving group:", error);
      toast.error("Failed to leave group. Please try again.");
    },
  });

  const handleBackClick = useCallback(() => {
    router.push("/chat");
  }, [router]);

  const handleJoinGroup = useCallback(
    async (groupId: string) => {
      if (!session?.user?.id) return;
      await joinMutation.mutateAsync(groupId);
    },
    [session?.user?.id, joinMutation]
  );

  const handleLeaveGroup = useCallback(async () => {
    if (!session?.user?.id) return;
    if (window.confirm("Are you sure you want to leave this group?")) {
      await leaveMutation.mutateAsync();
    }
  }, [session?.user?.id, leaveMutation]);

  // Scroll handling
  useEffect(() => {
    if (messages.length > 0 && shouldScrollToBottom) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldScrollToBottom]);

  useEffect(() => {
    const handleScroll = () => {
      const chatContainer = document.querySelector(".chat-messages");
      if (chatContainer) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainer;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShouldScrollToBottom(isNearBottom);
      }
    };

    const chatContainer = document.querySelector(".chat-messages");
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
      return () => chatContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Load more messages when scrolling up
  useEffect(() => {
    if (inView && hasMore && !loadingMore && isMember) {
      loadMore();
    }
  }, [inView, hasMore, loadingMore, loadMore, isMember]);

  // Initialize
  useEffect(() => {
    setHasInitialized(true);
  }, []);

  // Handle routing
  useEffect(() => {
    if (!hasInitialized) return;

    if (!groupId) {
      router.push("/chat");
      return;
    }

    if (groupError) {
      if (isMobile) {
        router.push("/chat");
      }
    }
  }, [groupId, groupError, isMobile, router, hasInitialized]);

  // Loading states
  if (groupLoading) {
    return (
      <div className="flex flex-col h-full bg-background rounded-lg shadow-lg overflow-hidden">
        <ChatHeaderSkeleton />
        <div className="flex-1 overflow-y-auto">
          <MessageListSkeleton />
        </div>
      </div>
    );
  }

  if (groupError || !group) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {group?.type === "PRIVATE" ? "Private Group" : "Group not found"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {group?.type === "PRIVATE"
            ? "You need to be a member to view this group's messages"
            : "The group you're looking for doesn't exist or has been deleted"}
        </p>
      </div>
    );
  }

  if (!groupId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MessageSquarePlus className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
        <p className="text-sm text-muted-foreground">
          {isMobile
            ? "Select a group to start chatting"
            : "Choose a group from the sidebar or create a new one to start chatting"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-lg shadow-lg overflow-hidden">
      <ChatHeader
        groupId={groupId}
        showBackButton={isMobile}
        onBackClick={handleBackClick}
        onLeaveGroup={handleLeaveGroup}
        isMember={isMember}
      />

      <div className="flex-1 overflow-y-auto chat-messages relative">
        {hasMore && isMember && (
          <div
            ref={loadMoreRef}
            className="h-10 flex items-center justify-center"
          >
            {loadingMore && (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary" />
            )}
          </div>
        )}

        {messagesError ? (
          <div className="flex items-center justify-center h-full text-destructive">
            Error loading messages: {messagesError}
          </div>
        ) : !isMember ? (
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent flex items-center justify-center">
            <div className="text-center p-6">
              <h3 className="text-lg font-medium mb-2">
                Join the conversation
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join this group to view messages and participate in the
                conversation
              </p>
              <Button
                onClick={() => handleJoinGroup(groupId)}
                disabled={joinMutation.isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {joinMutation.isLoading ? "Joining..." : "Join Group"}
              </Button>
            </div>
          </div>
        ) : messagesLoading ? (
          <MessageListSkeleton />
        ) : (
          <>
            <MessageList
              messages={messages}
              onDeleteMessage={deleteMessage}
              onToggleReaction={toggleReaction}
            />

            {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
          </>
        )}

        <div ref={chatEndRef} className="pt-4" />
      </div>

      {isMember && (
        <div className="relative">
          <MessageInput
            onSendMessage={sendMessage}
            onTyping={sendTypingIndicator}
            groupId={groupId}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(ChatContainer);