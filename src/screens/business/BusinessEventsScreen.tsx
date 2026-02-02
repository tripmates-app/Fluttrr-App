import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store';
import { Event } from '../../types';
import { Loading, EmptyState, Chip } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius, shadows } from '../../constants/spacing';
import { getBusinessEvents, deleteEvent } from '../../services/eventService';
import { formatEventDateShort } from '../../utils/dateTime';

const BusinessEventsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business } = useSelector((state: RootState) => state.auth);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    fetchEvents();
  }, [business, filter]);

  const fetchEvents = async () => {
    if (!business) return;
    try {
      const fetchedEvents = await getBusinessEvents(business.businessId, filter === 'all' ? undefined : filter);
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      setEvents(events.filter(e => e.eventId !== eventId));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <View style={[styles.eventCard, shadows.sm]}>
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDate}>{formatEventDateShort(item.startTime)}</Text>
        <View style={styles.eventStats}>
          <View style={styles.stat}>
            <Ionicons name="eye-outline" size={14} color={colors.textLight} />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people-outline" size={14} color={colors.textLight} />
            <Text style={styles.statText}>{item.currentAttendees}</Text>
          </View>
        </View>
      </View>
      <View style={styles.eventActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('EventAnalytics', { eventId: item.eventId })}>
          <Ionicons name="stats-chart" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('CreateEvent', { eventId: item.eventId })}>
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.eventId)}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {['all', 'upcoming', 'completed'].map((f) => (
          <Chip key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} selected={filter === f} onPress={() => setFilter(f as any)} />
        ))}
      </View>
      <FlatList
        data={events}
        keyExtractor={(item) => item.eventId}
        renderItem={renderEvent}
        ListEmptyComponent={<EmptyState icon="calendar-outline" title="No events" message="Create your first event!" />}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateEvent')}>
        <Ionicons name="add" size={28} color={colors.textWhite} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  filters: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm, backgroundColor: colors.background },
  listContent: { padding: spacing.md },
  eventCard: { backgroundColor: colors.background, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, flexDirection: 'row' },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: fontSizes.md, fontWeight: fontWeights.semiBold, color: colors.text },
  eventDate: { fontSize: fontSizes.sm, color: colors.textLight, marginTop: spacing.xs },
  eventStats: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: fontSizes.sm, color: colors.textLight },
  eventActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actionBtn: { padding: spacing.sm },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadows.lg },
});

export default BusinessEventsScreen;
