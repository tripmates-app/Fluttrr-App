import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { MatesStackParamList, User } from '../../types';
import { RootState } from '../../store';
import { Button, Chip, Loading, EmptyState, Avatar } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius, shadows } from '../../constants/spacing';
import { discoverMates, sendMateRequest } from '../../services/userService';
import { setDiscoveryUsers, setLoading, removeFromDiscovery } from '../../store/slices/usersSlice';
import { formatDistance, calculateDistance } from '../../utils/location';

type DiscoveryScreenProps = {
  navigation: NativeStackNavigationProp<MatesStackParamList, 'Discovery'>;
};

const DiscoveryScreen: React.FC<DiscoveryScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { discoveryUsers, filters, isLoading } = useSelector(
    (state: RootState) => state.users
  );
  const { user, userLocation } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDiscoveryUsers();
  }, [filters, userLocation]);

  const fetchDiscoveryUsers = async () => {
    if (!user || !userLocation) return;

    dispatch(setLoading(true));
    try {
      const { users } = await discoverMates(
        user.userId,
        filters,
        { latitude: userLocation.latitude, longitude: userLocation.longitude }
      );
      dispatch(setDiscoveryUsers(users));
    } catch (err) {
      console.error('Failed to discover mates:', err);
    }
  };

  const handleConnect = async (targetUserId: string) => {
    if (!user) return;
    try {
      await sendMateRequest(user.userId, targetUserId);
      dispatch(removeFromDiscovery(targetUserId));
    } catch (err: any) {
      console.error('Failed to send request:', err);
    }
  };

  const renderUser = ({ item }: { item: User }) => {
    const distance = userLocation
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          item.location?.latitude || 0,
          item.location?.longitude || 0
        )
      : null;

    return (
      <View style={[styles.userCard, shadows.md]}>
        {/* Photo */}
        <View style={styles.photoContainer}>
          {item.profilePhotos[0] ? (
            <Image source={{ uri: item.profilePhotos[0] }} style={styles.photo} />
          ) : (
            <View style={styles.noPhoto}>
              <Ionicons name="person" size={48} color={colors.textLight} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{item.displayName}</Text>
            <Text style={styles.userAge}>, {item.age}</Text>
          </View>

          {distance !== null && (
            <Text style={styles.distance}>{formatDistance(distance)} away</Text>
          )}

          {item.bio && (
            <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>
          )}

          {/* Interests */}
          <View style={styles.interests}>
            {item.interests.slice(0, 3).map((interest) => (
              <Chip key={interest} label={interest} size="small" style={styles.interestChip} />
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Connect"
              onPress={() => handleConnect(item.userId)}
              size="small"
              style={styles.connectButton}
            />
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => navigation.navigate('UserProfile', { userId: item.userId })}
            >
              <Text style={styles.viewButtonText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading && discoveryUsers.length === 0) {
    return <Loading fullScreen message="Finding people near you..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate('MatesFilters')}
        >
          <Ionicons name="options-outline" size={20} color={colors.primary} />
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.requestsButton}
          onPress={() => navigation.navigate('MateRequests')}
        >
          <Ionicons name="person-add-outline" size={20} color={colors.primary} />
          <Text style={styles.filterButtonText}>Requests</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={discoveryUsers}
        keyExtractor={(item) => item.userId}
        renderItem={renderUser}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No one nearby"
            message="Try adjusting your filters or check back later."
          />
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchDiscoveryUsers}
            tintColor={colors.primary}
          />
        }
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
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.primaryLight + '20',
    borderRadius: borderRadius.md,
  },
  requestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.primaryLight + '20',
    borderRadius: borderRadius.md,
  },
  filterButtonText: {
    color: colors.primary,
    fontWeight: fontWeights.medium,
    fontSize: fontSizes.sm,
  },
  listContent: {
    padding: spacing.md,
  },
  userCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  photoContainer: {
    height: 200,
  },
  photo: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundGray,
  },
  noPhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    padding: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  userName: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  userAge: {
    fontSize: fontSizes.lg,
    color: colors.text,
  },
  distance: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  bio: {
    fontSize: fontSizes.md,
    color: colors.textLight,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  interestChip: {},
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  connectButton: {
    flex: 1,
  },
  viewButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
  },
  viewButtonText: {
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
    fontSize: fontSizes.sm,
  },
});

export default DiscoveryScreen;
