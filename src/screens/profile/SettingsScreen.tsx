import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../../types';
import { RootState } from '../../store';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { updateUserProfile } from '../../services/userService';
import { updateUser } from '../../store/slices/authSlice';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleToggle = async (key: string, value: boolean) => {
    if (!user) return;

    try {
      const update: any = {};
      if (key.startsWith('privacy.')) {
        const privacyKey = key.replace('privacy.', '');
        update.privacySettings = {
          ...user.privacySettings,
          [privacyKey]: value,
        };
      } else if (key.startsWith('notifications.')) {
        const notifKey = key.replace('notifications.', '');
        update.notificationSettings = {
          ...user.notificationSettings,
          [notifKey]: value,
        };
      }

      await updateUserProfile(user.userId, update);
      dispatch(updateUser(update));
    } catch (err) {
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    hasToggle,
    toggleValue,
    toggleKey,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    hasToggle?: boolean;
    toggleValue?: boolean;
    toggleKey?: string;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={hasToggle}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {hasToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={(value) => toggleKey && handleToggle(toggleKey, value)}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={toggleValue ? colors.primary : colors.textLight}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Privacy Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <SettingItem
          icon="eye-outline"
          title="Show Distance"
          subtitle="Let others see how far you are"
          hasToggle
          toggleValue={user?.privacySettings?.showDistance}
          toggleKey="privacy.showDistance"
        />
        <SettingItem
          icon="ellipse"
          title="Show Online Status"
          subtitle="Show when you're online"
          hasToggle
          toggleValue={user?.privacySettings?.showOnlineStatus}
          toggleKey="privacy.showOnlineStatus"
        />
        <SettingItem
          icon="time-outline"
          title="Show Last Active"
          subtitle="Show when you were last active"
          hasToggle
          toggleValue={user?.privacySettings?.showLastActive}
          toggleKey="privacy.showLastActive"
        />
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <SettingItem
          icon="notifications-outline"
          title="Push Notifications"
          hasToggle
          toggleValue={user?.notificationSettings?.pushEnabled}
          toggleKey="notifications.pushEnabled"
        />
        <SettingItem
          icon="chatbubble-outline"
          title="New Messages"
          hasToggle
          toggleValue={user?.notificationSettings?.newMessages}
          toggleKey="notifications.newMessages"
        />
        <SettingItem
          icon="calendar-outline"
          title="Event Reminders"
          hasToggle
          toggleValue={user?.notificationSettings?.eventReminders}
          toggleKey="notifications.eventReminders"
        />
        <SettingItem
          icon="person-add-outline"
          title="New Mate Requests"
          hasToggle
          toggleValue={user?.notificationSettings?.newMateRequests}
          toggleKey="notifications.newMateRequests"
        />
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingItem
          icon="help-circle-outline"
          title="Help & FAQ"
          onPress={() => {}}
        />
        <SettingItem
          icon="shield-checkmark-outline"
          title="Safety & Support"
          onPress={() => {}}
        />
        <SettingItem
          icon="document-text-outline"
          title="Terms of Service"
          onPress={() => {}}
        />
        <SettingItem
          icon="lock-closed-outline"
          title="Privacy Policy"
          onPress={() => {}}
        />
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <SettingItem
          icon="information-circle-outline"
          title="About Fluttrr"
          subtitle="Version 1.0.0"
          onPress={() => {}}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  section: {
    backgroundColor: colors.background,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
    color: colors.textLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },
  settingSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textLight,
    marginTop: 2,
  },
});

export default SettingsScreen;
