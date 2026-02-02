import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, MateRequest } from '../../types';

interface MatesFilters {
  maxDistance?: number;
  minAge?: number;
  maxAge?: number;
  gender?: string;
  interests?: string[];
  lookingFor?: string;
  hasCommonEvents?: boolean;
}

interface UsersState {
  discoveryUsers: User[];
  mates: User[];
  receivedRequests: MateRequest[];
  sentRequests: MateRequest[];
  currentProfile: User | null;
  filters: MatesFilters;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMore: boolean;
}

const initialState: UsersState = {
  discoveryUsers: [],
  mates: [],
  receivedRequests: [],
  sentRequests: [],
  currentProfile: null,
  filters: {
    maxDistance: 25,
    minAge: 18,
    maxAge: 99,
  },
  isLoading: false,
  isRefreshing: false,
  error: null,
  hasMore: true,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setDiscoveryUsers: (state, action: PayloadAction<User[]>) => {
      state.discoveryUsers = action.payload;
      state.isLoading = false;
      state.isRefreshing = false;
      state.error = null;
    },
    appendDiscoveryUsers: (state, action: PayloadAction<User[]>) => {
      state.discoveryUsers = [...state.discoveryUsers, ...action.payload];
      state.isLoading = false;
    },
    setMates: (state, action: PayloadAction<User[]>) => {
      state.mates = action.payload;
    },
    addMate: (state, action: PayloadAction<User>) => {
      state.mates.push(action.payload);
    },
    removeMate: (state, action: PayloadAction<string>) => {
      state.mates = state.mates.filter((m) => m.userId !== action.payload);
    },
    setReceivedRequests: (state, action: PayloadAction<MateRequest[]>) => {
      state.receivedRequests = action.payload;
    },
    setSentRequests: (state, action: PayloadAction<MateRequest[]>) => {
      state.sentRequests = action.payload;
    },
    addReceivedRequest: (state, action: PayloadAction<MateRequest>) => {
      state.receivedRequests.push(action.payload);
    },
    removeReceivedRequest: (state, action: PayloadAction<string>) => {
      state.receivedRequests = state.receivedRequests.filter(
        (r) => r.requestId !== action.payload
      );
    },
    addSentRequest: (state, action: PayloadAction<MateRequest>) => {
      state.sentRequests.push(action.payload);
    },
    removeSentRequest: (state, action: PayloadAction<string>) => {
      state.sentRequests = state.sentRequests.filter(
        (r) => r.requestId !== action.payload
      );
    },
    setCurrentProfile: (state, action: PayloadAction<User | null>) => {
      state.currentProfile = action.payload;
    },
    setFilters: (state, action: PayloadAction<MatesFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        maxDistance: 25,
        minAge: 18,
        maxAge: 99,
      };
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
    removeFromDiscovery: (state, action: PayloadAction<string>) => {
      state.discoveryUsers = state.discoveryUsers.filter(
        (u) => u.userId !== action.payload
      );
    },
  },
});

export const {
  setDiscoveryUsers,
  appendDiscoveryUsers,
  setMates,
  addMate,
  removeMate,
  setReceivedRequests,
  setSentRequests,
  addReceivedRequest,
  removeReceivedRequest,
  addSentRequest,
  removeSentRequest,
  setCurrentProfile,
  setFilters,
  clearFilters,
  setLoading,
  setRefreshing,
  setError,
  setHasMore,
  removeFromDiscovery,
} = usersSlice.actions;

export default usersSlice.reducer;
