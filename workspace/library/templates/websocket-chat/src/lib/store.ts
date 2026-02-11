import { create } from "zustand";

interface Message {
  id: string;
  content: string;
  userId: string;
  channelId: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

interface Channel {
  id: string;
  name: string;
  description: string | null;
}

interface ChatState {
  // Current user
  currentUser: {
    id: string;
    name: string | null;
    avatar: string | null;
  } | null;
  setCurrentUser: (user: ChatState["currentUser"]) => void;

  // Channels
  channels: Channel[];
  setChannels: (channels: Channel[]) => void;
  addChannel: (channel: Channel) => void;

  // Active channel
  activeChannelId: string | null;
  setActiveChannelId: (id: string | null) => void;

  // Messages
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  removeMessage: (id: string) => void;

  // Typing indicators
  typingUsers: Map<string, { userId: string; name: string }>;
  setUserTyping: (channelId: string, userId: string, name: string) => void;
  removeUserTyping: (channelId: string, userId: string) => void;

  // Online users
  onlineUsers: Set<string>;
  setOnlineUsers: (users: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // Current user
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  // Channels
  channels: [],
  setChannels: (channels) => set({ channels }),
  addChannel: (channel) =>
    set((state) => ({ channels: [...state.channels, channel] })),

  // Active channel
  activeChannelId: null,
  setActiveChannelId: (id) => set({ activeChannelId: id }),

  // Messages
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  removeMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    })),

  // Typing indicators
  typingUsers: new Map(),
  setUserTyping: (channelId, userId, name) =>
    set((state) => {
      const key = `${channelId}:${userId}`;
      const newTypingUsers = new Map(state.typingUsers);
      newTypingUsers.set(key, { userId, name });
      return { typingUsers: newTypingUsers };
    }),
  removeUserTyping: (channelId, userId) =>
    set((state) => {
      const key = `${channelId}:${userId}`;
      const newTypingUsers = new Map(state.typingUsers);
      newTypingUsers.delete(key);
      return { typingUsers: newTypingUsers };
    }),

  // Online users
  onlineUsers: new Set(),
  setOnlineUsers: (users) => set({ onlineUsers: new Set(users) }),
  addOnlineUser: (userId) =>
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.add(userId);
      return { onlineUsers: newOnlineUsers };
    }),
  removeOnlineUser: (userId) =>
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.delete(userId);
      return { onlineUsers: newOnlineUsers };
    }),
}));
