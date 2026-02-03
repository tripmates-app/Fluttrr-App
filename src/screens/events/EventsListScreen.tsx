import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { EventsStackParamList, Event } from '../../types';
import { RootState } from '../../store';
import { EventCard } from '../../components/events/EventCard';
import { Loading, EmptyState } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { getEvents, searchEvents, joinEvent, leaveEvent } from '../../services/eventService';
import {
  setEvents,
  setLoading,
  setRefreshing,
  setSearchQuery,
  joinEvent as joinEventAction,
  leaveEvent as leaveEventAction,
} from '../../store/slices/eventsSlice';

type EventsListScreenProps = {
  navigation: NativeStackNavigationProp<EventsStackParamList, 'EventsList'>;
};

const EventsListScreen: React.FC<EventsListScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { events, isLoading, isRefreshing, searchQuery, filters, sortBy } =
    useSelector((state: RootState) => state.events);
  const { user, userLocation } = useSelector((state: RootState) => state.auth);

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const fetchEvents = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          dispatch(setRefreshing(true));
        } else {
          dispatch(setLoading(true));
        }

        if (searchQuery) {
          const results = await searchEvents(searchQuery);
          dispatch(setEvents(results));
        } else {
          const { events: fetchedEvents } = await getEvents(
            filters,
            sortBy,
            undefined,
            userLocation
              ? { latitude: userLocation.latitude, longitude: userLocation.longitude }
              : undefined
          );
          dispatch(setEvents(fetchedEvents));
        }
      } catch (err: any) {
        console.error('Failed to fetch events:', err);
      }
    },
    [dispatch, filters, sortBy, searchQuery, userLocation]
  );

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = () => {
    dispatch(setSearchQuery(localSearchQuery));
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    dispatch(setSearchQuery(''));
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
    } catch (err) {
      console.error('Failed to join/leave event:', err);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.textLight}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          placeholderTextColor={colors.textLight}
          value={localSearchQuery}
          onChangeText={setLocalSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {localSearchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch}>
            <Ionicons name="close-circle" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => navigation.navigate('Filters')}
      >
        <Ionicons name="options-outline" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderEvent = ({ item }: { item: Event }) => (
    <EventCard
      event={item}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.eventId })}
      onJoin={() => handleJoinEvent(item.eventId)}
      userLocation={userLocation}
      userId={user?.userId}
    />
  );

  if (isLoading && events.length === 0) {
    return <Loading fullScreen message="Loading events..." />;
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={events}
        keyExtractor={(item) => item.eventId}
        renderItem={renderEvent}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title={searchQuery ? 'No results found' : 'No events available'}
            message={
              searchQuery
                ? `No events match "${searchQuery}"`
                : 'Check back later for upcoming events.'
            }
            actionLabel={searchQuery ? 'Clear Search' : undefined}
            onAction={searchQuery ? handleClearSearch : undefined}
          />
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchEvents(true)}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: borderRadius.md,
  },
  listContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});

export default EventsListScreen;
