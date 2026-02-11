"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Smile, Paperclip } from "lucide-react";
import { useChatStore } from "@/lib/store";
import { useRealtime } from "@/lib/use-realtime";
import { cn } from "@/lib/utils";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { activeChannelId } = useChatStore();
  const { handleTyping } = useRealtime(activeChannelId);

  const handleSend = async () => {
    if (!message.trim() || !activeChannelId || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: message.trim(),
          channelId: activeChannelId,
        }),
      });

      if (response.ok) {
        setMessage("");
        textareaRef.current?.focus();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    handleTyping();

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  if (!activeChannelId) {
    return null;
  }

  return (
    <div className="border-t p-4">
      <div className="flex items-end gap-2 rounded-xl bg-muted p-2">
        {/* Attachment Button */}
        <button
          type="button"
          className="flex-shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-foreground"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="max-h-[120px] min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm focus:outline-none"
        />

        {/* Emoji Button */}
        <button
          type="button"
          className="flex-shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-foreground"
        >
          <Smile className="h-5 w-5" />
        </button>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          className={cn(
            "flex-shrink-0 rounded-lg bg-primary p-2 text-primary-foreground transition",
            !message.trim() || isSending
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-primary/90"
          )}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-2 text-center text-xs text-muted-foreground">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
