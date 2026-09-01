import "emoji-picker-element";
import { useEffect, useRef, useState } from "react";
import GifPicker, { type Gif } from "./GifPicker";

interface PickerProps {
  onEmojiSelect: (emoji: string) => void;
  onGifSelect: (gif: Gif) => void;
}

interface EmojiClickEvent extends Event {
  detail: {
    emoji: { unicode: string };
    unicode?: string;
  };
}

export default function Picker({ onEmojiSelect, onGifSelect }: PickerProps) {
  const [activePicker, setActivePicker] = useState<"emoji" | "gif">("emoji");
  const emojiPickerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const picker = emojiPickerRef.current;
    if (!picker) return;

    const handleEmojiClick = (event: Event) => {
      const { detail } = event as EmojiClickEvent;
      onEmojiSelect(detail.unicode ?? detail.emoji.unicode);
    };

    picker.addEventListener("emoji-click", handleEmojiClick);
    return () => picker.removeEventListener("emoji-click", handleEmojiClick);
  }, [onEmojiSelect]);

  return (
    <div className="picker" role="dialog" aria-label="Message picker">
      <div className="picker-tabs" role="tablist" aria-label="Picker type">
        <button
          type="button"
          role="tab"
          aria-selected={activePicker === "emoji"}
          className={activePicker === "emoji" ? "is-active" : ""}
          onClick={() => setActivePicker("emoji")}
        >
          Emoji
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activePicker === "gif"}
          className={activePicker === "gif" ? "is-active" : ""}
          onClick={() => setActivePicker("gif")}
        >
          GIF
        </button>
      </div>
      {activePicker === "emoji" ? (
        <emoji-picker ref={emojiPickerRef} className="dark" />
      ) : (
        <div className="picker-gif-wrapper">
          <GifPicker onGifSelect={onGifSelect} />
        </div>
      )}
    </div>
  );
}
