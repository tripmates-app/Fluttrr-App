import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList, Event } from '../../types';
import { RootState } from '../../store';
import { EventCard } from '../../components/events/EventCard';
import { Chip, Loading, EmptyState } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import { getEvents, joinEvent, leaveEvent, markInterested } from '../../services/eventService';
import {
  setEvents,
  setLoading,
  setRefreshing,
  setError,
  joinEvent as joinEventAction,
  leaveEvent as leaveEventAction,
} from '../../store/slices/eventsSlice';
import { getDateFilters } from '../../utils/dateTime';

type FeedScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Feed'>;
};

type FilterType = 'all' | 'today' | 'thisWeek' | 'nearby' | 'friendsGoing';

const FeedScreen: React.FC<FeedScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { events, isLoading, isRefreshing, error } = useSelector(
    (state: RootState) => state.events
  );
  const { user, userLocation } = useSelector((state: RootState) => state.auth);

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const fetchFeed = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          dispatch(setRefreshing(true));
        } else {
          dispatch(setLoading(true));
        }

        const dateFilters = getDateFilters();
        let filters: any = {};

        if (activeFilter === 'today') {
          filters.startDate = dateFilters.today.start;
          filters.endDate = dateFilters.today.end;
        } else if (activeFilter === 'thisWeek') {
          filters.startDate = dateFilters.thisWeek.start;
          filters.endDate = dateFilters.thisWeek.end;
        }

        const { events: fetchedEvents } = await getEvents(
          filters,
          activeFilter === 'nearby' ? 'distance' : 'date',
          undefined,
          userLocation
            ? { latitude: userLocation.latitude, longitude: userLocation.longitude }
            : undefined
        );

        let filteredEvents = fetchedEvents;

        if (activeFilter === 'nearby' && userLocation) {
          // Already sorted by distance
        } else if (activeFilter === 'friendsGoing' && user?.mates) {
          filteredEvents = fetchedEvents.filter((event) =>
            event.attendees.some((attendeeId) => user.mates.includes(attendeeId))
          );
        }

        dispatch(setEvents(filteredEvents));
      } catch (err: any) {
        dispatch(setError(err.message || 'Failed to load feed'));
      }
    },
    [dispatch, activeFilter, userLocation, user?.mates]
  );

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleRefresh = () => {
    fetchFeed(true);
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const event = events.find((e) => e.eventId === eventId);
      if (!event) return;

      if (event.attendees.includes(user.userId)) {
        await leaveEvent(eventId, user.userId);
        dispatch(leaveEventAction({ eventId, userId: user.userId }));
      } else {
        await joinEvent(eventId, user.userId, user.displayName, user.profilePhotos[0] || '');
        dispatch(joinEventAction({ eventId, userId: user.userId }));
      }
    } catch (err: any) {
      console.error('Failed to join/leave event:', err);
    }
  };

  const handleInterested = async (eventId: string) => {
    if (!user) return;
    try {
      await markInterested(eventId, user.userId);
    } catch (err) {
      console.error('Failed to mark interested:', err);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.displayName?.split(' ')[0] || 'Friend'}!
          </Text>
          <Text style={styles.location}>
            <Ionicons name="location" size={14} color={colors.primary} />
            {' '}{userLocation?.city || 'Kansas City'}, {userLocation?.state || 'MO'}
          </Text>
        </View>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>F</Text>
        </View>
      </View>

      <View style={styles.filters}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { id: 'all', label: 'All Events' },
            { id: 'today', label: 'Today' },
            { id: 'thisWeek', label: 'This Week' },
            { id: 'nearby', label: 'Nearby' },
            { id: 'friendsGoing', label: 'Friends Going' },
          ]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Chip
              label={item.label}
              selected={activeFilter === item.id}
              onPress={() => setActiveFilter(item.id as FilterType)}
              style={styles.filterChip}
            />
          )}
        />
      </View>
    </View>
  );

  const renderEvent = ({ item }: { item: Event }) => (
    <EventCard
      event={item}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.eventId })}
      onJoin={() => handleJoinEvent(item.eventId)}
      onInterested={() => handleInterested(item.eventId)}
      userLocation={userLocation}
      userId={user?.userId}
    />
  );

  if (isLoading && events.length === 0) {
    return <Loading fullScreen message="Loading events..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.eventId}
        renderItem={renderEvent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No events found"
            message={
              activeFilter === 'friendsGoing'
                ? "None of your friends are going to any events yet."
                : "No events match your filters. Try adjusting them."
            }
            actionLabel="Clear Filters"
            onAction={() => setActiveFilter('all')}
          />
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    backgroundColor: colors.background,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  location: {
    fontSize: fontSizes.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textWhite,
  },
  filters: {
    paddingLeft: spacing.md,
  },
  filterChip: {
    marginRight: spacing.sm,
  },
});

export default FeedScreen;
