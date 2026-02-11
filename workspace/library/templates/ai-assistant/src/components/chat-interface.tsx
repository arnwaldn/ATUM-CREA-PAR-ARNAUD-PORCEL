"use client";

import { useChat } from "ai/react";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { useRef, useEffect } from "react";

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
    });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">
                Welcome to AI Assistant
              </h2>
              <p className="text-muted-foreground">
                Ask me anything! I can search the web, check weather, and more.
              </p>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg">
            Error: {error.message}
          </div>
        )}
      </div>
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
