// app/components/useChat.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { pusherClient, ChatEvents, getGroupChannel } from '@/lib/pusher';
import axios from 'axios';
import { appendStoredMessage, getStoredMessages, removeStoredMessage, storeMessages, updateStoredMessageReaction } from '@/lib/storage';
import { useQueryClient } from '@tanstack/react-query';

export interface MessageContent {
  id: string;
  type: string;
  order: number;
  content?: string;
  mediaUrl?: string;
  metadata?: any;
}

interface MessageReaction {
  id: string;
  emoji: string;
  userId: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
}

export interface Message {
  id: string;
  groupId: string;
  senderId: string;
  createdAt: Date;
  isSystem: boolean;
  contents: MessageContent[];
  reactions: MessageReaction[];
  sender: {
    id: string;
    name: string;
    image: string;
    walletAddress: string;
  };
}

interface TypingUser {
  id: string;
  name: string;
  timestamp: number;
}

export const useChat = (groupId: string) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>(() => {
    return getStoredMessages(groupId) || [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const nextCursorRef = useRef<string | null>(null);
  const channelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const initialLoadRef = useRef(false);

  useEffect(() => {
    if (!groupId || (!session?.user?.email && !localStorage.getItem('walletAddress'))) return;

    const channelName = `private-${getGroupChannel(groupId)}`;
    const channel = pusherClient.subscribe(channelName);
    channelRef.current = channel;

    channel.bind(ChatEvents.NEW_MESSAGE, (message: Message) => {
      setMessages(prev => {
        const updated = [...prev, message];
        appendStoredMessage(groupId, message);
        return updated;
      });
    });

    channel.bind(ChatEvents.MESSAGE_DELETED, ({ messageId }: { messageId: string }) => {
      setMessages(prev => {
        const updated = prev.filter(msg => msg.id !== messageId);
        removeStoredMessage(groupId, messageId);
        return updated;
      });
    });

    channel.bind(ChatEvents.REACTION_UPDATED, ({
      messageId,
      reaction,
      action
    }: {
      messageId: string;
      reaction: MessageReaction;
      action: 'added' | 'removed';
    }) => {
      setMessages(prev => {
        const updated = prev.map(msg => {
          if (msg.id !== messageId) return msg;
          
          const updatedReactions = action === 'added'
            ? [...msg.reactions, reaction]
            : msg.reactions.filter(r => 
                !(r.userId === reaction.userId && r.emoji === reaction.emoji)
              );
          
          return { ...msg, reactions: updatedReactions };
        });

        updateStoredMessageReaction(groupId, messageId, reaction, action);
        return updated;
      });
    });

    // Handle system messages
    ['member-joined', 'member-left', 'member-removed'].forEach(event => {
      channel.bind(event, (data: { systemMessage: Message }) => {
        setMessages(prev => {
          const updated = [...prev, data.systemMessage];
          appendStoredMessage(groupId, data.systemMessage);
          return updated;
        });
      });
    });

    // Only load messages if we don't have them cached
    if (!initialLoadRef.current) {
      loadMessages();
      initialLoadRef.current = true;
    }

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
      typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutRef.current.clear();
    };
  }, [groupId, session?.user?.email]);

  const updateMessages = useCallback((newMessages: Message[]) => {
    setMessages(newMessages);
    storeMessages(groupId, newMessages);
  }, [groupId]);

  const loadMessages = async (cursor?: string) => {
    try {
      setLoadingMore(true);
      const response = await axios.get(`/api/chat/groups/${groupId}/messages`, {
        params: { 
          cursor, 
          limit: 50,
          wallet_address: localStorage.getItem('walletAddress')
        }
      });
      
      const { messages: newMessages, nextCursor } = response.data;
      
      setMessages(prev => {
        const updated = cursor 
          ? [...prev, ...newMessages]
          : newMessages;
        
        // Only store if this is the initial load
        if (!cursor) {
          storeMessages(groupId, updated);
        }
        
        return updated;
      });
      
      nextCursorRef.current = nextCursor;
      setHasMore(!!nextCursor);
      setError(null);
      queryClient.setQueryData(['chat-messages', groupId], {
        messages: newMessages,
        nextCursor
      });
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const sendMessage = async (contents: MessageContent[]) => {
    try {
      const walletAddress = localStorage.getItem('walletAddress');
      const config = walletAddress ? {
        headers: {
          'X-Wallet-Address': walletAddress
        }
      } : undefined;

      const { data } = await axios.post(`/api/chat/groups/${groupId}/messages`, {
        contents
      }, config);

      setMessages(prev => [...prev, data]);
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const walletAddress = localStorage.getItem('walletAddress');
      const config = walletAddress ? {
        headers: {
          'X-Wallet-Address': walletAddress
        }
      } : {};

      await axios.delete(
        `/api/chat/groups/${groupId}/messages/${messageId}`,
        config
      );

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
      throw err;
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    try {
      const walletAddress = localStorage.getItem('walletAddress');
      const config = walletAddress ? {
        headers: {
          'X-Wallet-Address': walletAddress
        }
      } : {};

      const { data } = await axios.post(
        `/api/chat/groups/${groupId}/messages/${messageId}/reactions`,
        { emoji },
        config
      );

      setMessages(prev => prev.map(msg => {
        if (msg.id !== messageId) return msg;

        const userId = session?.user?.id || walletAddress;
        const existingReaction = msg.reactions.find(
          r => r.userId === userId && r.emoji === emoji
        );

        let updatedReactions = [...msg.reactions];
        if (existingReaction) {
          updatedReactions = updatedReactions.filter(
            r => !(r.userId === userId && r.emoji === emoji)
          );
        } else {
          updatedReactions.push(data.reaction);
        }

        return { ...msg, reactions: updatedReactions };
      }));
    } catch (err) {
      console.error('Error toggling reaction:', err);
      throw err;
    }
  };

  const sendTypingIndicator = (isTyping: boolean) => {
    if (!channelRef.current) return;

    const userId = session?.user?.id || localStorage.getItem('walletAddress');
    const name = session?.user?.name || 'Anonymous';

    if (!userId) return;

    if (typingTimeoutRef.current.has(userId)) {
      clearTimeout(typingTimeoutRef.current.get(userId));
      typingTimeoutRef.current.delete(userId);
    }

    channelRef.current.trigger('client-typing', {
      userId,
      name,
      isTyping
    });

    if (isTyping) {
      const timeout = setTimeout(() => {
        if (channelRef.current) {
          channelRef.current.trigger('client-typing', {
            userId,
            name,
            isTyping: false
          });
        }
        typingTimeoutRef.current.delete(userId);
      }, 3000);

      typingTimeoutRef.current.set(userId, timeout);
    }
  };

  return {
    messages,
    loading,
    error,
    hasMore,
    loadingMore,
    typingUsers: Array.from(typingUsers.values()),
    sendMessage,
    deleteMessage,
    toggleReaction,
    sendTypingIndicator,
    loadMore: () => loadMessages(nextCursorRef.current),
  };
};

export default useChat;