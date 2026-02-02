import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { ProfileStackParamList, Event } from '../../types';
import { RootState } from '../../store';
import { EventCard } from '../../components/events/EventCard';
import { Loading, EmptyState } from '../../components/common';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { getEventsByIds } from '../../services/eventService';

type MyEventsScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'MyEvents'>;
};

const MyEventsScreen: React.FC<MyEventsScreenProps> = ({ navigation }) => {
  const { user, userLocation } = useSelector((state: RootState) => state.auth);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, [user]);

  const fetchMyEvents = async () => {
    if (!user?.eventsJoined) {
      setIsLoading(false);
      return;
    }

    try {
      const fetchedEvents = await getEventsByIds(user.eventsJoined);
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading your events..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.eventId}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => {}}
            userLocation={userLocation}
            userId={user?.userId}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No events yet"
            message="Join some events to see them here!"
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  listContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});

export default MyEventsScreen;
