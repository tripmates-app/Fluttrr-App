import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Business, Event } from '../../types';
import { Loading, Button, Chip } from '../../components/common';
import { EventCard } from '../../components/events/EventCard';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import { getBusinessById } from '../../services/businessService';
import { getEvents } from '../../services/eventService';

const { width } = Dimensions.get('window');

type BusinessProfileParams = {
  businessId: string;
};

type Props = {
  route: RouteProp<{ BusinessProfile: BusinessProfileParams }, 'BusinessProfile'>;
  navigation: any;
};

const BusinessProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { businessId } = route.params;
  const [business, setBusiness] = useState<Business | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBusinessData = useCallback(async () => {
    try {
      const [fetchedBusiness, { events: fetchedEvents }] = await Promise.all([
        getBusinessById(businessId),
        getEvents({ businessId }),
      ]);
      setBusiness(fetchedBusiness);
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Failed to fetch business:', err);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchBusinessData();
  }, [fetchBusinessData]);

  if (isLoading) return <Loading fullScreen />;
  if (!business) return <View style={styles.container}><Text>Business not found</Text></View>;

  return (
    <ScrollView style={styles.container}>
      {business.photos[0] && (
        <Image source={{ uri: business.photos[0] }} style={styles.coverImage} />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{business.businessName}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color={colors.warning} />
            <Text style={styles.rating}>{business.averageRating?.toFixed(1) || 'New'}</Text>
            <Text style={styles.reviewCount}>({business.totalReviews} reviews)</Text>
          </View>
          <Chip label={business.category} size="small" style={styles.categoryChip} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{business.description}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text style={styles.infoText}>{business.address}</Text>
          </View>
          {business.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
              <Text style={styles.infoText}>{business.phone}</Text>
            </View>
          )}
          {business.website && (
            <View style={styles.infoRow}>
              <Ionicons name="globe-outline" size={20} color={colors.primary} />
              <Text style={styles.infoText}>{business.website}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {events.length > 0 ? (
            events.slice(0, 3).map((event) => (
              <EventCard
                key={event.eventId}
                event={event}
                onPress={() => navigation.navigate('EventDetail', { eventId: event.eventId })}
                compact
              />
            ))
          ) : (
            <Text style={styles.noEvents}>No upcoming events</Text>
          )}
        </View>

        <Button title="Follow Business" onPress={() => {}} fullWidth variant="outline" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  coverImage: { width, height: 200, backgroundColor: colors.backgroundGray },
  content: { padding: spacing.md },
  header: { marginBottom: spacing.lg },
  name: { fontSize: fontSizes.xxl, fontWeight: fontWeights.bold, color: colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.xs },
  rating: { fontSize: fontSizes.md, fontWeight: fontWeights.semiBold, color: colors.text },
  reviewCount: { fontSize: fontSizes.sm, color: colors.textLight },
  categoryChip: { marginTop: spacing.sm, alignSelf: 'flex-start' },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.semiBold, color: colors.text, marginBottom: spacing.sm },
  description: { fontSize: fontSizes.md, color: colors.text, lineHeight: 22 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  infoText: { fontSize: fontSizes.md, color: colors.text, flex: 1 },
  noEvents: { fontSize: fontSizes.md, color: colors.textLight, fontStyle: 'italic' },
});

export default BusinessProfileScreen;
