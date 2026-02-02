import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Event } from '../../types';

interface EventFilters {
  category?: string;
  distance?: number;
  startDate?: string;
  endDate?: string;
  price?: string;
  ageRestriction?: string;
  timeOfDay?: string;
}

interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  myEvents: Event[];
  joinedEvents: Event[];
  filters: EventFilters;
  sortBy: 'date' | 'distance' | 'popularity';
  searchQuery: string;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMore: boolean;
}

const initialState: EventsState = {
  events: [],
  currentEvent: null,
  myEvents: [],
  joinedEvents: [],
  filters: {},
  sortBy: 'date',
  searchQuery: '',
  isLoading: false,
  isRefreshing: false,
  error: null,
  hasMore: true,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
      state.isLoading = false;
      state.isRefreshing = false;
      state.error = null;
    },
    appendEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = [...state.events, ...action.payload];
      state.isLoading = false;
    },
    setCurrentEvent: (state, action: PayloadAction<Event | null>) => {
      state.currentEvent = action.payload;
    },
    setMyEvents: (state, action: PayloadAction<Event[]>) => {
      state.myEvents = action.payload;
    },
    setJoinedEvents: (state, action: PayloadAction<Event[]>) => {
      state.joinedEvents = action.payload;
    },
    updateEvent: (state, action: PayloadAction<Event>) => {
      const index = state.events.findIndex(
        (e) => e.eventId === action.payload.eventId
      );
      if (index !== -1) {
        state.events[index] = action.payload;
      }
      if (state.currentEvent?.eventId === action.payload.eventId) {
        state.currentEvent = action.payload;
      }
    },
    removeEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter((e) => e.eventId !== action.payload);
      state.myEvents = state.myEvents.filter((e) => e.eventId !== action.payload);
    },
    setFilters: (state, action: PayloadAction<EventFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSortBy: (state, action: PayloadAction<'date' | 'distance' | 'popularity'>) => {
      state.sortBy = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isRefreshing = false;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    joinEvent: (state, action: PayloadAction<{ eventId: string; userId: string }>) => {
      const event = state.events.find((e) => e.eventId === action.payload.eventId);
      if (event) {
        event.attendees.push(action.payload.userId);
        event.currentAttendees++;
      }
      if (state.currentEvent?.eventId === action.payload.eventId) {
        state.currentEvent.attendees.push(action.payload.userId);
        state.currentEvent.currentAttendees++;
      }
    },
    leaveEvent: (state, action: PayloadAction<{ eventId: string; userId: string }>) => {
      const event = state.events.find((e) => e.eventId === action.payload.eventId);
      if (event) {
        event.attendees = event.attendees.filter((id) => id !== action.payload.userId);
        event.currentAttendees--;
      }
      if (state.currentEvent?.eventId === action.payload.eventId) {
        state.currentEvent.attendees = state.currentEvent.attendees.filter(
          (id) => id !== action.payload.userId
        );
        state.currentEvent.currentAttendees--;
      }
    },
  },
});

export const {
  setEvents,
  appendEvents,
  setCurrentEvent,
  setMyEvents,
  setJoinedEvents,
  updateEvent,
  removeEvent,
  setFilters,
  clearFilters,
  setSortBy,
  setSearchQuery,
  setLoading,
  setRefreshing,
  setError,
  setHasMore,
  joinEvent,
  leaveEvent,
} = eventsSlice.actions;

export default eventsSlice.reducer;
