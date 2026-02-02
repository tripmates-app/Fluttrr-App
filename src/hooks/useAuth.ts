import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { auth } from '../services/firebase';
import {
  getUserProfile,
  getBusinessProfile,
  checkAccountType,
  updateUserOnlineStatus,
} from '../services/authService';
import {
  setUser,
  setBusiness,
  setLoading,
  setError,
  logout as logoutAction,
  setUserLocation,
} from '../store/slices/authSlice';
import { RootState } from '../store';
import { getCurrentLocation, getAddressFromCoordinates, DEFAULT_LOCATION } from '../utils/location';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, business, accountType, isAuthenticated, isLoading, error, userLocation } =
    useSelector((state: RootState) => state.auth);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const type = await checkAccountType(firebaseUser.uid);

          if (type === 'user') {
            const userProfile = await getUserProfile(firebaseUser.uid);
            if (userProfile) {
              dispatch(setUser(userProfile));
              await updateUserOnlineStatus(firebaseUser.uid, true);

              // Get and set user location
              await initializeLocation(firebaseUser.uid);
            } else {
              // User exists in Firebase Auth but no profile yet
              dispatch(setLoading(false));
            }
          } else if (type === 'business') {
            const businessProfile = await getBusinessProfile(firebaseUser.uid);
            if (businessProfile) {
              dispatch(setBusiness(businessProfile));
            }
          } else {
            // New user, needs to create profile
            dispatch(setLoading(false));
          }
        } catch (err) {
          dispatch(setError('Failed to load profile'));
        }
      } else {
        dispatch(logoutAction());
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  const initializeLocation = useCallback(async (userId: string) => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        const address = await getAddressFromCoordinates(
          location.latitude,
          location.longitude
        );
        dispatch(
          setUserLocation({
            latitude: location.latitude,
            longitude: location.longitude,
            city: address?.city || DEFAULT_LOCATION.city,
            state: address?.state || DEFAULT_LOCATION.state,
          })
        );
      } else {
        dispatch(setUserLocation(DEFAULT_LOCATION));
      }
    } catch (err) {
      dispatch(setUserLocation(DEFAULT_LOCATION));
    }
  }, [dispatch]);

  return {
    user,
    business,
    accountType,
    isAuthenticated,
    isLoading: isLoading || initializing,
    error,
    userLocation,
  };
};

export default useAuth;
