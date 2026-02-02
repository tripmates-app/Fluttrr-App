import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventsReducer from './slices/eventsSlice';
import chatsReducer from './slices/chatsSlice';
import usersReducer from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    chats: chatsReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'auth/setUser',
          'events/setEvents',
          'chats/setChats',
          'chats/setMessages',
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'auth.user',
          'events.events',
          'events.currentEvent',
          'chats.chats',
          'chats.messages',
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
