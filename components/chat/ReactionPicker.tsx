// app/components/chat/ReactionPicker.tsx
import { useState, useEffect, useRef } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useTheme } from 'next-themes';

const COMMON_EMOJIS = ['🚀', '💎', '🔥', '🤑', '🐂', '🫡', '🤝',  '🦍'];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export const ReactionPicker = ({ onSelect, onClose }: ReactionPickerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [showFullPicker, setShowFullPicker] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div ref={ref} className="relative">
      <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg p-2 flex gap-1 items-center">
        {COMMON_EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors"
          >
            {emoji}
          </button>
        ))}
        <button
          onClick={() => setShowFullPicker(true)}
          className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors"
        >
          <span className="text-xl">+</span>
        </button>
      </div>

      {showFullPicker && (
        <div className="absolute bottom-12 right-0">
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => {
              onSelect(emoji.native);
              setShowFullPicker(false);
            }}
            onClickOutside={() => setShowFullPicker(false)}
            theme={resolvedTheme}
            set="native"
            previewPosition="none"
            skinTonePosition="none"
            perLine={8}
            maxFrequentRows={0}
          />
        </div>
      )}
    </div>
  );
};