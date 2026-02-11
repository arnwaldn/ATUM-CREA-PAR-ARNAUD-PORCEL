"use client";

import { useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import { useChatStore } from "./store";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useRealtime(channelId: string | null) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    currentUser,
    addMessage,
    setUserTyping,
    removeUserTyping,
    addOnlineUser,
    removeOnlineUser,
  } = useChatStore();

  // Subscribe to channel
  useEffect(() => {
    if (!channelId || !currentUser) return;

    // Create realtime channel
    const channel = supabase.channel(`room:${channelId}`, {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    // Listen for new messages
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Message",
        filter: `channelId=eq.${channelId}`,
      },
      (payload) => {
        // Fetch the full message with user data
        fetchMessage(payload.new.id);
      }
    );

    // Listen for typing indicators
    channel.on("broadcast", { event: "typing" }, (payload) => {
      const { userId, name, isTyping } = payload.payload;
      if (userId === currentUser.id) return;

      if (isTyping) {
        setUserTyping(channelId, userId, name);
      } else {
        removeUserTyping(channelId, userId);
      }
    });

    // Handle presence (online users)
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      Object.keys(state).forEach((userId) => addOnlineUser(userId));
    });

    channel.on("presence", { event: "join" }, ({ key }) => {
      addOnlineUser(key);
    });

    channel.on("presence", { event: "leave" }, ({ key }) => {
      removeOnlineUser(key);
    });

    // Subscribe and track presence
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: currentUser.id,
          name: currentUser.name,
          online_at: new Date().toISOString(),
        });
      }
    });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [
    channelId,
    currentUser,
    addMessage,
    setUserTyping,
    removeUserTyping,
    addOnlineUser,
    removeOnlineUser,
  ]);

  // Fetch full message with user data
  const fetchMessage = async (messageId: string) => {
    const response = await fetch(`/api/messages/${messageId}`);
    if (response.ok) {
      const message = await response.json();
      addMessage(message);
    }
  };

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (!channelRef.current || !currentUser) return;

      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: {
          userId: currentUser.id,
          name: currentUser.name,
          isTyping,
        },
      });
    },
    [currentUser]
  );

  // Handle typing with debounce
  const handleTyping = useCallback(() => {
    sendTypingIndicator(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 3000);
  }, [sendTypingIndicator]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return { handleTyping };
}
