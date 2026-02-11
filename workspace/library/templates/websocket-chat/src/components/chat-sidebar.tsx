"use client";

import { Hash, Plus, Settings, Users } from "lucide-react";
import { useChatStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ChatSidebar() {
  const { channels, activeChannelId, setActiveChannelId, onlineUsers } =
    useChatStore();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-muted/30">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        <h1 className="font-semibold">Chat</h1>
        <button className="rounded-md p-1.5 hover:bg-muted">
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Online Users */}
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {onlineUsers.size} online
        </span>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Channels
          </span>
          <button className="rounded-md p-1 hover:bg-muted">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-0.5">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setActiveChannelId(channel.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition hover:bg-muted",
                activeChannelId === channel.id && "bg-muted"
              )}
            >
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{channel.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* User Info */}
      <div className="border-t p-4">
        <UserInfo />
      </div>
    </aside>
  );
}

function UserInfo() {
  const { currentUser, onlineUsers } = useChatStore();

  if (!currentUser) return null;

  const isOnline = onlineUsers.has(currentUser.id);

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-sm font-medium text-primary-foreground">
            {currentUser.name?.charAt(0) ?? "U"}
          </span>
        </div>
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
            isOnline ? "bg-green-500" : "bg-muted-foreground"
          )}
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{currentUser.name ?? "User"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {isOnline ? "Online" : "Offline"}
        </p>
      </div>
    </div>
  );
}
