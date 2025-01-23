import { Message } from "@/components/useChat";

const MESSAGE_STORAGE_PREFIX = "chat_messages_";
const MESSAGE_CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

interface StoredMessages {
  messages: Message[];
  timestamp: number;
}

export const storeMessages = (groupId: string, messages: Message[]) => {
  try {
    const data: StoredMessages = {
      messages,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${MESSAGE_STORAGE_PREFIX}${groupId}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error storing messages:', error);
  }
};

export const getStoredMessages = (groupId: string): Message[] | null => {
  try {
    const data = localStorage.getItem(`${MESSAGE_STORAGE_PREFIX}${groupId}`);
    if (!data) return null;

    const parsed: StoredMessages = JSON.parse(data);
    const age = Date.now() - parsed.timestamp;

    // Return null if cache is expired
    if (age > MESSAGE_CACHE_DURATION) {
      localStorage.removeItem(`${MESSAGE_STORAGE_PREFIX}${groupId}`);
      return null;
    }

    return parsed.messages;
  } catch (error) {
    console.error('Error retrieving messages:', error);
    return null;
  }
};

export const clearStoredMessages = (groupId: string) => {
  try {
    localStorage.removeItem(`${MESSAGE_STORAGE_PREFIX}${groupId}`);
  } catch (error) {
    console.error('Error clearing messages:', error);
  }
};

// Add message to existing stored messages
export const appendStoredMessage = (groupId: string, message: Message) => {
  try {
    const existing = getStoredMessages(groupId) || [];
    storeMessages(groupId, [...existing, message]);
  } catch (error) {
    console.error('Error appending message:', error);
  }
};

// Remove message from stored messages
export const removeStoredMessage = (groupId: string, messageId: string) => {
  try {
    const existing = getStoredMessages(groupId) || [];
    const updated = existing.filter(msg => msg.id !== messageId);
    storeMessages(groupId, updated);
  } catch (error) {
    console.error('Error removing message:', error);
  }
};

// Update reaction in stored messages
export const updateStoredMessageReaction = (
  groupId: string, 
  messageId: string, 
  reaction: any, 
  action: 'added' | 'removed'
) => {
  try {
    const existing = getStoredMessages(groupId) || [];
    const updated = existing.map(msg => {
      if (msg.id !== messageId) return msg;

      const updatedReactions = action === 'added' 
        ? [...msg.reactions, reaction]
        : msg.reactions.filter(r => 
            !(r.userId === reaction.userId && r.emoji === reaction.emoji)
          );

      return { ...msg, reactions: updatedReactions };
    });

    storeMessages(groupId, updated);
  } catch (error) {
    console.error('Error updating message reaction:', error);
  }
};