// app/components/chat/EmojiPicker.tsx
'use client';

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useTheme } from 'next-themes';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: any) => void;
    onClickOutside: () => void;
}

export function EmojiPicker({ onEmojiSelect, onClickOutside }: EmojiPickerProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="absolute bottom-full right-0 mb-2 z-50">
      <Picker 
        data={data} 
        onEmojiSelect={onEmojiSelect}
        onClickOutside={onClickOutside}
        theme={resolvedTheme}
        set="native"
        previewPosition="none"
      />
    </div>
  );
}