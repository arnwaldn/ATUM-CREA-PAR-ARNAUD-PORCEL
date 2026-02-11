"use client";

import { useEffect, useRef } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { useChatStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ChatMessages() {
  const { messages, currentUser, activeChannelId, typingUsers } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Filter messages for active channel
  const channelMessages = messages.filter(
    (m) => m.channelId === activeChannelId
  );

  // Get typing users for this channel
  const channelTypingUsers = Array.from(typingUsers.entries())
    .filter(([key]) => key.startsWith(`${activeChannelId}:`))
    .map(([, value]) => value);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [channelMessages.length]);

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, "h:mm a");
    }
    if (isYesterday(date)) {
      return "Yesterday " + format(date, "h:mm a");
    }
    return format(date, "MMM d, h:mm a");
  };

  if (!activeChannelId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Select a channel to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4">
      <div className="flex-1 space-y-4">
        {channelMessages.map((message, index) => {
          const isCurrentUser = message.userId === currentUser?.id;
          const showAvatar =
            index === 0 ||
            channelMessages[index - 1].userId !== message.userId;

          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                isCurrentUser && "flex-row-reverse"
              )}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {showAvatar ? (
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      isCurrentUser ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isCurrentUser
                          ? "text-primary-foreground"
                          : "text-foreground"
                      )}
                    >
                      {message.user.name?.charAt(0) ?? "U"}
                    </span>
                  </div>
                ) : (
                  <div className="w-8" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={cn(
                  "flex max-w-[70%] flex-col gap-1",
                  isCurrentUser && "items-end"
                )}
              >
                {showAvatar && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {message.user.name ?? "User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatMessageDate(message.createdAt)}
                    </span>
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2",
                    isCurrentUser
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {channelTypingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TypingDots />
            <span>
              {channelTypingUsers.length === 1
                ? `${channelTypingUsers[0].name} is typing...`
                : `${channelTypingUsers.length} people are typing...`}
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1">
      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
    </div>
  );
}
