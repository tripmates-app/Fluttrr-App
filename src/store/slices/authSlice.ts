import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Business, Location } from '../../types';

interface AuthState {
  user: User | null;
  business: Business | null;
  accountType: 'user' | 'business' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userLocation: Location | null;
}

const initialState: AuthState = {
  user: null,
  business: null,
  accountType: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  userLocation: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.accountType = 'user';
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    setBusiness: (state, action: PayloadAction<Business>) => {
      state.business = action.payload;
      state.accountType = 'business';
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateBusiness: (state, action: PayloadAction<Partial<Business>>) => {
      if (state.business) {
        state.business = { ...state.business, ...action.payload };
      }
    },
    setUserLocation: (state, action: PayloadAction<Location>) => {
      state.userLocation = action.payload;
      if (state.user) {
        state.user.location = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.business = null;
      state.accountType = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setUser,
  setBusiness,
  updateUser,
  updateBusiness,
  setUserLocation,
  setLoading,
  setError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
