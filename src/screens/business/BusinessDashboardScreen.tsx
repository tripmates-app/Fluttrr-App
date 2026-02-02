import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store';
import { Card, Loading } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius, shadows } from '../../constants/spacing';
import { getBusinessDashboardStats } from '../../services/businessService';

const BusinessDashboardScreen: React.FC = () => {
  const { business } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [business]);

  const fetchStats = async () => {
    if (!business) return;
    try {
      const fetchedStats = await getBusinessDashboardStats(business.businessId);
      setStats(fetchedStats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  if (isLoading) return <Loading fullScreen message="Loading dashboard..." />;

  const StatCard = ({ icon, title, value, color }: { icon: string; title: string; value: number | string; color: string }) => (
    <View style={[styles.statCard, shadows.sm]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.businessName}>{business?.businessName}</Text>
        {business?.verificationStatus === 'pending' && (
          <View style={styles.pendingBanner}>
            <Ionicons name="time-outline" size={16} color={colors.warning} />
            <Text style={styles.pendingText}>Verification pending</Text>
          </View>
        )}
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon="calendar" title="Upcoming Events" value={stats?.upcomingEvents || 0} color={colors.primary} />
        <StatCard icon="checkmark-done" title="Past Events" value={stats?.pastEvents || 0} color={colors.success} />
        <StatCard icon="people" title="Total Attendees" value={stats?.totalAttendees || 0} color={colors.accent} />
        <StatCard icon="star" title="Avg Rating" value={stats?.averageRating?.toFixed(1) || 'N/A'} color={colors.warning} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle" size={32} color={colors.primary} />
            <Text style={styles.actionText}>Create Event</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="list" size={32} color={colors.primary} />
            <Text style={styles.actionText}>Manage Events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubbles" size={32} color={colors.primary} />
            <Text style={styles.actionText}>Reviews ({stats?.pendingReviews || 0})</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  header: { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xl },
  greeting: { fontSize: fontSizes.md, color: colors.textWhite + '80' },
  businessName: { fontSize: fontSizes.xxl, fontWeight: fontWeights.bold, color: colors.textWhite, marginTop: spacing.xs },
  pendingBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.warning + '20', padding: spacing.sm, borderRadius: borderRadius.md, marginTop: spacing.md, gap: spacing.xs },
  pendingText: { fontSize: fontSizes.sm, color: colors.warning, fontWeight: fontWeights.medium },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, gap: spacing.md },
  statCard: { width: '47%', backgroundColor: colors.background, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center' },
  statIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  statValue: { fontSize: fontSizes.xxl, fontWeight: fontWeights.bold, color: colors.text },
  statTitle: { fontSize: fontSizes.sm, color: colors.textLight, marginTop: spacing.xs },
  section: { padding: spacing.md },
  sectionTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.semiBold, color: colors.text, marginBottom: spacing.md },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: { width: '30%', backgroundColor: colors.background, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', ...shadows.sm },
  actionText: { fontSize: fontSizes.sm, color: colors.text, marginTop: spacing.sm, textAlign: 'center' },
});

export default BusinessDashboardScreen;
