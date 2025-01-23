// app/components/chat/MessageInput.tsx
"use client"
import { useState, useRef, useEffect } from 'react';
import { ImageIcon, SmileIcon, Send, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmojiPicker } from './EmojiPicker';
import { uploadMedia } from '@/lib/uploadMedia';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '../tweets/hooks/use-media-query';

interface MessageInputProps {
  onSendMessage: (contents: any[]) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  groupId: string;
}

const MessageInput = ({ onSendMessage, onTyping, groupId }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      await onSendMessage([{
        type: 'TEXT',
        content: message.trim()
      }]);
      setMessage('');
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const mediaUrl = await uploadMedia({file, type: 'message', groupId});
      
      await onSendMessage([{
        type: file.type.startsWith('image/') ? 'IMAGE' : 'FILE',
        mediaUrl,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type
        }
      }]);
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`relative ${isMobile ? 'z-[12233] bg-black' : ''}`} ref={containerRef}>
      <motion.div 
        initial={false}
        animate={{
          boxShadow: isFocused 
            ? '0 0 20px rgba(147, 51, 234, 0.3)' 
            : '0 0 0px rgba(147, 51, 234, 0)'
        }}
        className={`
          border-t border-border/10
          bg-background/50
          backdrop-blur-xl
          p-4 space-y-4
          relative
          transition-all duration-300
        `}
      >
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              onTyping(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="write your stuff here..."
            className={`
              pr-24 min-h-[80px] resize-none
              rounded-xl
              bg-card/50
              border 
              ${isFocused 
                ? 'border-primary/50' 
                : 'border-border/10'
              }
              transition-all duration-300
              placeholder:text-muted-foreground/50
              focus:ring-1 focus:ring-primary/20
              text-base
            `}
          />
          
          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="icon"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-full hover:bg-primary/10 hover:text-primary"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="rounded-full hover:bg-primary/10 hover:text-primary"
              >
                <SmileIcon className="h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!message.trim() || uploading}
                className={`
                  rounded-full 
                  bg-primary
                  hover:bg-primary/90
                  text-primary-foreground
                  shadow-lg hover:shadow-primary/25
                  disabled:bg-muted disabled:text-muted-foreground
                  transition-all duration-300
                `}
              >
                <Send className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full right-0 mb-2"
              >
                <div className="bg-card rounded-xl shadow-xl border border-border">
                  <EmojiPicker 
                    onEmojiSelect={(emoji) => {
                      setMessage(prev => prev + emoji.native);
                      setShowEmojiPicker(false);
                    }}
                    onClickOutside={() => setShowEmojiPicker(false)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {uploading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-background/50 rounded-xl flex items-center justify-center"
            >
              <div className="flex items-center space-x-2 text-primary">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span>Uploading...</span>
              </div>
            </motion.div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default MessageInput;

