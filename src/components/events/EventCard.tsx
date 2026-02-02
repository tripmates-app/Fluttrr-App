import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../../types';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius, shadows } from '../../constants/spacing';
import { formatEventDateShort } from '../../utils/dateTime';
import { formatDistance, calculateDistance } from '../../utils/location';
import { Avatar, Badge } from '../common';

const { width } = Dimensions.get('window');

interface EventCardProps {
  event: Event;
  onPress: () => void;
  onJoin?: () => void;
  onInterested?: () => void;
  userLocation?: { latitude: number; longitude: number } | null;
  userId?: string;
  compact?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  onJoin,
  onInterested,
  userLocation,
  userId,
  compact = false,
}) => {
  const isJoined = userId ? event.attendees.includes(userId) : false;
  const isInterested = userId ? event.interested.includes(userId) : false;

  const distance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        event.location.latitude,
        event.location.longitude
      )
    : null;

  const attendeePhotos = event.attendees.slice(0, 3);

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.cardCompact, shadows.sm]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: event.coverPhoto || event.photos[0] }}
          style={styles.imageCompact}
        />
        <View style={styles.contentCompact}>
          <Text style={styles.titleCompact} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={styles.dateCompact}>
            {formatEventDateShort(event.startTime)}
          </Text>
          {distance !== null && (
            <Text style={styles.distanceCompact}>{formatDistance(distance)}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, shadows.md]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.coverPhoto || event.photos[0] }}
          style={styles.image}
        />
        {event.price === 'free' && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>FREE</Text>
          </View>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.businessInfo}>
            {event.businessLogo && (
              <Image source={{ uri: event.businessLogo }} style={styles.businessLogo} />
            )}
            <Text style={styles.businessName} numberOfLines={1}>
              {event.businessName}
            </Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textLight} />
            <Text style={styles.detailText}>
              {formatEventDateShort(event.startTime)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={colors.textLight} />
            <Text style={styles.detailText} numberOfLines={1}>
              {event.location.name || event.location.address}
            </Text>
            {distance !== null && (
              <Text style={styles.distance}> ({formatDistance(distance)})</Text>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.attendees}>
            <View style={styles.avatarStack}>
              {attendeePhotos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.attendeeAvatar,
                    { marginLeft: index > 0 ? -8 : 0 },
                  ]}
                >
                  <Avatar size="small" />
                </View>
              ))}
            </View>
            {event.currentAttendees > 0 && (
              <Text style={styles.attendeeCount}>
                {event.currentAttendees} going
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            {onInterested && (
              <TouchableOpacity
                style={[styles.actionButton, isInterested && styles.actionButtonActive]}
                onPress={onInterested}
              >
                <Ionicons
                  name={isInterested ? 'star' : 'star-outline'}
                  size={18}
                  color={isInterested ? colors.warning : colors.textLight}
                />
              </TouchableOpacity>
            )}
            {onJoin && (
              <TouchableOpacity
                style={[
                  styles.joinButton,
                  isJoined && styles.joinButtonActive,
                ]}
                onPress={onJoin}
              >
                <Text
                  style={[
                    styles.joinButtonText,
                    isJoined && styles.joinButtonTextActive,
                  ]}
                >
                  {isJoined ? 'Joined' : 'Join'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cardCompact: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    width: (width - spacing.md * 3) / 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.backgroundGray,
  },
  imageCompact: {
    width: '100%',
    height: 100,
    backgroundColor: colors.backgroundGray,
  },
  freeBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.success,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  freeBadgeText: {
    color: colors.textWhite,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
  },
  categoryBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.overlay,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    color: colors.textWhite,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
  },
  content: {
    padding: spacing.md,
  },
  contentCompact: {
    padding: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  businessLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: spacing.xs,
  },
  businessName: {
    fontSize: fontSizes.sm,
    color: colors.textLight,
    flex: 1,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  titleCompact: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: 2,
  },
  details: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    fontSize: fontSizes.sm,
    color: colors.textLight,
    marginLeft: spacing.xs,
    flex: 1,
  },
  distance: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  dateCompact: {
    fontSize: fontSizes.xs,
    color: colors.textLight,
  },
  distanceCompact: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: fontWeights.medium,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attendees: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  attendeeAvatar: {
    borderWidth: 2,
    borderColor: colors.background,
    borderRadius: 16,
  },
  attendeeCount: {
    fontSize: fontSizes.sm,
    color: colors.textLight,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
  },
  actionButtonActive: {},
  joinButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  joinButtonActive: {
    backgroundColor: colors.backgroundGray,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  joinButtonText: {
    color: colors.textWhite,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
  },
  joinButtonTextActive: {
    color: colors.primary,
  },
});

export default EventCard;
