import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../../types';
import { RootState } from '../../store';
import { Button, Chip, Avatar } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius, shadows } from '../../constants/spacing';
import { formatMemberSince } from '../../utils/dateTime';
import { signOut } from '../../services/authService';
import { logout } from '../../store/slices/authSlice';

const { width } = Dimensions.get('window');

type MyProfileScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'MyProfile'>;
};

const MyProfileScreen: React.FC<MyProfileScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await signOut();
      dispatch(logout());
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Photos Section */}
      <View style={styles.photosSection}>
        {user.profilePhotos.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {user.profilePhotos.map((photo, index) => (
              <Image key={index} source={{ uri: photo }} style={styles.photo} />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noPhotoPlaceholder}>
            <Ionicons name="person" size={64} color={colors.textLight} />
          </View>
        )}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="pencil" size={20} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.displayName}</Text>
            {user.verified && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </View>
          <Text style={styles.age}>{user.age} years old</Text>
          <Text style={styles.location}>
            <Ionicons name="location" size={14} color={colors.primary} />
            {' '}{user.location?.city || 'Kansas City'}, {user.location?.state || 'MO'}
          </Text>
        </View>

        {/* Bio */}
        {user.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>
        )}

        {/* Looking For */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Looking For</Text>
          <Chip
            label={user.lookingFor?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Open to All'}
            selected
            style={styles.lookingForChip}
          />
        </View>

        {/* Interests */}
        {user.interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestsContainer}>
              {user.interests.map((interest) => (
                <Chip key={interest} label={interest} size="small" style={styles.interestChip} />
              ))}
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.eventsAttended?.length || 0}</Text>
            <Text style={styles.statLabel}>Events Attended</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.reviewsGiven?.length || 0}</Text>
            <Text style={styles.statLabel}>Reviews Given</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.mates?.length || 0}</Text>
            <Text style={styles.statLabel}>Mates</Text>
          </View>
        </View>

        {/* Member Since */}
        <Text style={styles.memberSince}>
          Member since {formatMemberSince(user.createdAt)}
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
            fullWidth
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="My Events"
            onPress={() => navigation.navigate('MyEvents')}
            fullWidth
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Settings"
            onPress={() => navigation.navigate('Settings')}
            fullWidth
            variant="outline"
            style={styles.actionButton}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  photosSection: {
    position: 'relative',
    height: 350,
  },
  photo: {
    width,
    height: 350,
    backgroundColor: colors.backgroundGray,
  },
  noPhotoPlaceholder: {
    width,
    height: 350,
    backgroundColor: colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  age: {
    fontSize: fontSizes.md,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  location: {
    fontSize: fontSizes.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  bio: {
    fontSize: fontSizes.md,
    color: colors.text,
    lineHeight: 22,
  },
  lookingForChip: {
    alignSelf: 'flex-start',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  interestChip: {
    marginBottom: spacing.xs,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundGray,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  memberSince: {
    fontSize: fontSizes.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {},
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: fontSizes.md,
    color: colors.error,
    fontWeight: fontWeights.medium,
  },
});

export default MyProfileScreen;
