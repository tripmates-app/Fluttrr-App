import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  setEvents,
  appendEvents,
  setCurrentEvent,
  setLoading,
  setRefreshing,
  setError,
  setHasMore,
  joinEvent as joinEventAction,
  leaveEvent as leaveEventAction,
} from '../store/slices/eventsSlice';
import {
  getEvents,
  getEvent,
  joinEvent as joinEventService,
  leaveEvent as leaveEventService,
  searchEvents,
} from '../services/eventService';

export const useEvents = () => {
  const dispatch = useDispatch();
  const {
    events,
    currentEvent,
    filters,
    sortBy,
    searchQuery,
    isLoading,
    isRefreshing,
    error,
    hasMore,
  } = useSelector((state: RootState) => state.events);
  const { userLocation, user } = useSelector((state: RootState) => state.auth);

  const fetchEvents = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          dispatch(setRefreshing(true));
        } else {
          dispatch(setLoading(true));
        }

        const { events: fetchedEvents, lastDoc } = await getEvents(
          filters,
          sortBy,
          undefined,
          userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : undefined
        );

        dispatch(setEvents(fetchedEvents));
        dispatch(setHasMore(fetchedEvents.length >= 20));
      } catch (err: any) {
        dispatch(setError(err.message || 'Failed to load events'));
      }
    },
    [dispatch, filters, sortBy, userLocation]
  );

  const loadMoreEvents = useCallback(async () => {
    if (!hasMore || isLoading) return;

    try {
      dispatch(setLoading(true));
      const { events: moreEvents, lastDoc } = await getEvents(
        filters,
        sortBy,
        undefined,
        userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : undefined
      );

      dispatch(appendEvents(moreEvents));
      dispatch(setHasMore(moreEvents.length >= 20));
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to load more events'));
    }
  }, [dispatch, filters, sortBy, userLocation, hasMore, isLoading]);

  const fetchEventById = useCallback(
    async (eventId: string) => {
      try {
        dispatch(setLoading(true));
        const event = await getEvent(eventId);
        dispatch(setCurrentEvent(event));
        return event;
      } catch (err: any) {
        dispatch(setError(err.message || 'Failed to load event'));
        return null;
      }
    },
    [dispatch]
  );

  const joinEvent = useCallback(
    async (eventId: string) => {
      if (!user) return;

      try {
        await joinEventService(
          eventId,
          user.userId,
          user.displayName,
          user.profilePhotos[0] || ''
        );
        dispatch(joinEventAction({ eventId, userId: user.userId }));
      } catch (err: any) {
        dispatch(setError(err.message || 'Failed to join event'));
      }
    },
    [dispatch, user]
  );

  const leaveEvent = useCallback(
    async (eventId: string) => {
      if (!user) return;

      try {
        await leaveEventService(eventId, user.userId);
        dispatch(leaveEventAction({ eventId, userId: user.userId }));
      } catch (err: any) {
        dispatch(setError(err.message || 'Failed to leave event'));
      }
    },
    [dispatch, user]
  );

  const search = useCallback(
    async (query: string) => {
      try {
        dispatch(setLoading(true));
        const results = await searchEvents(query);
        dispatch(setEvents(results));
      } catch (err: any) {
        dispatch(setError(err.message || 'Search failed'));
      }
    },
    [dispatch]
  );

  return {
    events,
    currentEvent,
    filters,
    sortBy,
    searchQuery,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    fetchEvents,
    loadMoreEvents,
    fetchEventById,
    joinEvent,
    leaveEvent,
    search,
  };
};

export default useEvents;
