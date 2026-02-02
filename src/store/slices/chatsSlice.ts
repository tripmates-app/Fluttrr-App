import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat, Message } from '../../types';

interface ChatsState {
  chats: Chat[];
  directChats: Chat[];
  eventChats: Chat[];
  currentChat: Chat | null;
  messages: { [chatId: string]: Message[] };
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatsState = {
  chats: [],
  directChats: [],
  eventChats: [],
  currentChat: null,
  messages: {},
  unreadCount: 0,
  isLoading: false,
  error: null,
};

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
      state.directChats = action.payload.filter((c) => c.type === 'direct');
      state.eventChats = action.payload.filter((c) => c.type === 'event_group');
      state.isLoading = false;
      state.error = null;
    },
    setCurrentChat: (state, action: PayloadAction<Chat | null>) => {
      state.currentChat = action.payload;
    },
    setMessages: (
      state,
      action: PayloadAction<{ chatId: string; messages: Message[] }>
    ) => {
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: Message }>
    ) => {
      const { chatId, message } = action.payload;
      if (state.messages[chatId]) {
        // Add to beginning since messages are sorted newest first
        state.messages[chatId] = [message, ...state.messages[chatId]];
      } else {
        state.messages[chatId] = [message];
      }

      // Update last message in chat
      const chatIndex = state.chats.findIndex((c) => c.chatId === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = {
          text: message.text || '',
          senderId: message.senderId,
          timestamp: message.timestamp,
        };
        state.chats[chatIndex].updatedAt = message.timestamp;
      }
    },
    updateChat: (state, action: PayloadAction<Chat>) => {
      const index = state.chats.findIndex(
        (c) => c.chatId === action.payload.chatId
      );
      if (index !== -1) {
        state.chats[index] = action.payload;
      }
      if (state.currentChat?.chatId === action.payload.chatId) {
        state.currentChat = action.payload;
      }
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount++;
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount--;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearCurrentChat: (state) => {
      state.currentChat = null;
    },
    archiveChat: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find((c) => c.chatId === action.payload);
      if (chat) {
        chat.isArchived = true;
      }
    },
    muteChat: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find((c) => c.chatId === action.payload);
      if (chat) {
        chat.isMuted = true;
      }
    },
    unmuteChat: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find((c) => c.chatId === action.payload);
      if (chat) {
        chat.isMuted = false;
      }
    },
  },
});

export const {
  setChats,
  setCurrentChat,
  setMessages,
  addMessage,
  updateChat,
  setUnreadCount,
  incrementUnreadCount,
  decrementUnreadCount,
  setLoading,
  setError,
  clearCurrentChat,
  archiveChat,
  muteChat,
  unmuteChat,
} = chatsSlice.actions;

export default chatsSlice.reducer;
