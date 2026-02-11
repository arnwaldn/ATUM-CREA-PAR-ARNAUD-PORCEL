"use client";

import { useEffect } from "react";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import { useChatStore } from "@/lib/store";
import { useRealtime } from "@/lib/use-realtime";

export default function ChatPage() {
  const { setCurrentUser, setChannels, setMessages, activeChannelId } =
    useChatStore();

  // Initialize realtime connection
  useRealtime(activeChannelId);

  // Load initial data
  useEffect(() => {
    // TODO: Replace with actual auth
    setCurrentUser({
      id: "demo-user",
      name: "Demo User",
      avatar: null,
    });

    // Load channels
    fetch("/api/channels")
      .then((res) => res.json())
      .then((data) => setChannels(data))
      .catch(console.error);
  }, [setCurrentUser, setChannels]);

  // Load messages when channel changes
  useEffect(() => {
    if (!activeChannelId) return;

    fetch(`/api/messages?channelId=${activeChannelId}`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch(console.error);
  }, [activeChannelId, setMessages]);

  return (
    <div className="flex h-screen">
      <ChatSidebar />
      <main className="flex flex-1 flex-col">
        <ChatHeader />
        <ChatMessages />
        <ChatInput />
      </main>
    </div>
  );
}

function ChatHeader() {
  const { channels, activeChannelId } = useChatStore();
  const activeChannel = channels.find((c) => c.id === activeChannelId);

  if (!activeChannel) {
    return (
      <header className="flex h-14 items-center border-b px-4">
        <span className="text-muted-foreground">Select a channel</span>
      </header>
    );
  }

  return (
    <header className="flex h-14 items-center border-b px-4">
      <div>
        <h2 className="font-semibold">#{activeChannel.name}</h2>
        {activeChannel.description && (
          <p className="text-xs text-muted-foreground">
            {activeChannel.description}
          </p>
        )}
      </div>
    </header>
  );
}
