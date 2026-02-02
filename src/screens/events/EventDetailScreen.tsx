import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { EventsStackParamList, Event, User } from '../../types';
import { RootState } from '../../store';
import { Button, Avatar, Loading, Chip } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius, shadows } from '../../constants/spacing';
import { getEvent, joinEvent, leaveEvent } from '../../services/eventService';
import { getUsersByIds } from '../../services/userService';
import { formatEventDateRange } from '../../utils/dateTime';
import { formatDistance, calculateDistance } from '../../utils/location';
import {
  setCurrentEvent,
  joinEvent as joinEventAction,
  leaveEvent as leaveEventAction,
} from '../../store/slices/eventsSlice';

const { width } = Dimensions.get('window');

type EventDetailScreenProps = {
  navigation: NativeStackNavigationProp<EventsStackParamList, 'EventDetail'>;
  route: RouteProp<EventsStackParamList, 'EventDetail'>;
};

const EventDetailScreen: React.FC<EventDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { eventId } = route.params;
  const dispatch = useDispatch();
  const { currentEvent } = useSelector((state: RootState) => state.events);
  const { user, userLocation } = useSelector((state: RootState) => state.auth);

  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [attendees, setAttendees] = useState<User[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isJoined = user && currentEvent?.attendees.includes(user.userId);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const event = await getEvent(eventId);
      if (event) {
        dispatch(setCurrentEvent(event));

        // Fetch attendee profiles
        if (event.attendees.length > 0) {
          const attendeeProfiles = await getUsersByIds(event.attendees.slice(0, 10));
          setAttendees(attendeeProfiles);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!user || !currentEvent) return;

    setIsJoining(true);
    try {
      if (isJoined) {
        await leaveEvent(eventId, user.userId);
        dispatch(leaveEventAction({ eventId, userId: user.userId }));
      } else {
        await joinEvent(eventId, user.userId, user.displayName, user.profilePhotos[0] || '');
        dispatch(joinEventAction({ eventId, userId: user.userId }));
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update event');
    } finally {
      setIsJoining(false);
    }
  };

  const handleShare = async () => {
    if (!currentEvent) return;
    try {
      await Share.share({
        message: `Check out ${currentEvent.title} on Fluttrr!\n\n${currentEvent.description.substring(0, 100)}...`,
        title: currentEvent.title,
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handleChatPress = () => {
    if (!currentEvent?.groupChatId) return;
    navigation.getParent()?.navigate('ChatsTab', {
      screen: 'ChatScreen',
      params: {
        chatId: currentEvent.groupChatId,
        chatTitle: currentEvent.title,
        chatType: 'event_group',
      },
    });
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading event..." />;
  }

  if (!currentEvent) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Event not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const distance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        currentEvent.location.latitude,
        currentEvent.location.longitude
      )
    : null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {currentEvent.photos.map((photo, index) => (
              <Image key={index} source={{ uri: photo }} style={styles.image} />
            ))}
          </ScrollView>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Image Indicators */}
          {currentEvent.photos.length > 1 && (
            <View style={styles.imageIndicators}>
              {currentEvent.photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Price Badge */}
          {currentEvent.price === 'free' ? (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>FREE</Text>
            </View>
          ) : currentEvent.priceAmount ? (
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>
                ${currentEvent.priceAmount}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Business Info */}
          <TouchableOpacity
            style={styles.businessInfo}
            onPress={() => {
              // Navigate to business profile
            }}
          >
            {currentEvent.businessLogo && (
              <Image
                source={{ uri: currentEvent.businessLogo }}
                style={styles.businessLogo}
              />
            )}
            <View style={styles.businessDetails}>
              <Text style={styles.businessName}>{currentEvent.businessName}</Text>
              <Text style={styles.category}>{currentEvent.category}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>{currentEvent.title}</Text>

          {/* Tags */}
          <View style={styles.tags}>
            {currentEvent.tags.slice(0, 4).map((tag) => (
              <Chip key={tag} label={tag} size="small" style={styles.tag} />
            ))}
          </View>

          {/* Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {formatEventDateRange(currentEvent.startTime, currentEvent.endTime)}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>
                  {currentEvent.location.name || currentEvent.location.address}
                </Text>
                {distance !== null && (
                  <Text style={styles.distance}>{formatDistance(distance)} away</Text>
                )}
              </View>
            </View>

            {currentEvent.ageRestriction !== 'none' && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="person-outline" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Age Restriction</Text>
                  <Text style={styles.detailValue}>{currentEvent.ageRestriction}</Text>
                </View>
              </View>
            )}

            {currentEvent.capacity && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="people-outline" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Capacity</Text>
                  <Text style={styles.detailValue}>
                    {currentEvent.currentAttendees} / {currentEvent.capacity} spots
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{currentEvent.description}</Text>
          </View>

          {/* Who's Going */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Who's Going</Text>
              <Text style={styles.attendeeCount}>
                {currentEvent.currentAttendees} people
              </Text>
            </View>

            {attendees.length > 0 ? (
              <View style={styles.attendeesList}>
                {attendees.slice(0, 8).map((attendee) => (
                  <View key={attendee.userId} style={styles.attendeeItem}>
                    <Avatar
                      uri={attendee.profilePhotos[0]}
                      name={attendee.displayName}
                      size="medium"
                    />
                    <Text style={styles.attendeeName} numberOfLines={1}>
                      {attendee.displayName.split(' ')[0]}
                    </Text>
                  </View>
                ))}
                {currentEvent.currentAttendees > 8 && (
                  <View style={styles.attendeeItem}>
                    <View style={styles.moreAttendees}>
                      <Text style={styles.moreAttendeesText}>
                        +{currentEvent.currentAttendees - 8}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.noAttendees}>
                Be the first to join this event!
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          title={isJoined ? 'Leave Event' : 'Join Event'}
          onPress={handleJoinEvent}
          variant={isJoined ? 'outline' : 'primary'}
          loading={isJoining}
          style={styles.joinButton}
        />
        {isJoined && currentEvent.groupChatId && (
          <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
            <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fontSizes.lg,
    color: colors.textLight,
    marginBottom: spacing.lg,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  image: {
    width,
    height: 300,
    backgroundColor: colors.backgroundGray,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  shareButton: {
    position: 'absolute',
    top: 50,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textWhite + '80',
  },
  indicatorActive: {
    backgroundColor: colors.textWhite,
    width: 16,
  },
  freeBadge: {
    position: 'absolute',
    top: 50,
    left: spacing.md + 50,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  freeBadgeText: {
    color: colors.textWhite,
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.sm,
  },
  priceBadge: {
    position: 'absolute',
    top: 50,
    left: spacing.md + 50,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  priceBadgeText: {
    color: colors.textWhite,
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.sm,
  },
  content: {
    padding: spacing.md,
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  businessLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundGray,
    marginRight: spacing.sm,
  },
  businessDetails: {
    flex: 1,
  },
  businessName: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  category: {
    fontSize: fontSizes.sm,
    color: colors.textLight,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tag: {
    marginRight: spacing.xs,
  },
  detailsSection: {
    backgroundColor: colors.backgroundGray,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSizes.sm,
    color: colors.textLight,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },
  distance: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSizes.md,
    color: colors.text,
    lineHeight: 24,
  },
  attendeeCount: {
    fontSize: fontSizes.sm,
    color: colors.textLight,
  },
  attendeesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  attendeeItem: {
    alignItems: 'center',
    width: 60,
  },
  attendeeName: {
    fontSize: fontSizes.xs,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  moreAttendees: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreAttendeesText: {
    fontSize: fontSizes.sm,
    color: colors.textLight,
    fontWeight: fontWeights.semiBold,
  },
  noAttendees: {
    fontSize: fontSizes.md,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  joinButton: {
    flex: 1,
  },
  chatButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EventDetailScreen;
