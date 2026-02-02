import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { signOut } from '../../services/authService';
import { logout } from '../../store/slices/authSlice';

const BusinessSettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { business } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => {
        await signOut();
        dispatch(logout());
      }},
    ]);
  };

  const SettingItem = ({ icon, title, subtitle, onPress, danger }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
        <Ionicons name={icon} size={22} color={danger ? colors.error : colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.businessInfo}>
        <View style={styles.businessAvatar}>
          <Text style={styles.avatarText}>{business?.businessName?.charAt(0) || 'B'}</Text>
        </View>
        <Text style={styles.businessName}>{business?.businessName}</Text>
        <Text style={styles.businessEmail}>{business?.email}</Text>
        <View style={styles.badge}>
          <Ionicons name={business?.verificationStatus === 'approved' ? 'checkmark-circle' : 'time'} size={14} color={business?.verificationStatus === 'approved' ? colors.success : colors.warning} />
          <Text style={[styles.badgeText, { color: business?.verificationStatus === 'approved' ? colors.success : colors.warning }]}>
            {business?.verificationStatus === 'approved' ? 'Verified' : 'Pending Verification'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Settings</Text>
        <SettingItem icon="business-outline" title="Edit Business Profile" subtitle="Update your business information" onPress={() => {}} />
        <SettingItem icon="notifications-outline" title="Notifications" subtitle="Manage notification preferences" onPress={() => {}} />
        <SettingItem icon="card-outline" title="Subscription" subtitle="Free Plan" onPress={() => {}} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingItem icon="help-circle-outline" title="Help Center" onPress={() => {}} />
        <SettingItem icon="document-text-outline" title="Terms for Businesses" onPress={() => {}} />
        <SettingItem icon="shield-checkmark-outline" title="Privacy Policy" onPress={() => {}} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem icon="log-out-outline" title="Log Out" onPress={handleLogout} danger />
      </View>

      <Text style={styles.version}>Fluttrr Business v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  businessInfo: { backgroundColor: colors.background, padding: spacing.xl, alignItems: 'center' },
  businessAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: fontSizes.xxxl, fontWeight: fontWeights.bold, color: colors.textWhite },
  businessName: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.text },
  businessEmail: { fontSize: fontSizes.sm, color: colors.textLight, marginTop: spacing.xs },
  badge: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.xs },
  badgeText: { fontSize: fontSizes.sm, fontWeight: fontWeights.medium },
  section: { backgroundColor: colors.background, marginTop: spacing.md },
  sectionTitle: { fontSize: fontSizes.sm, fontWeight: fontWeights.semiBold, color: colors.textLight, padding: spacing.md, paddingBottom: spacing.sm, textTransform: 'uppercase' },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  settingIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight + '20', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  settingIconDanger: { backgroundColor: colors.error + '20' },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: fontSizes.md, color: colors.text, fontWeight: fontWeights.medium },
  settingTitleDanger: { color: colors.error },
  settingSubtitle: { fontSize: fontSizes.sm, color: colors.textLight, marginTop: 2 },
  version: { textAlign: 'center', fontSize: fontSizes.sm, color: colors.textLight, padding: spacing.xl },
});

export default BusinessSettingsScreen;
