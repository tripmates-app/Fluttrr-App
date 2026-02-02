import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Loading, Card } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius, shadows } from '../../constants/spacing';
import { getEventAnalytics } from '../../services/businessService';

type Props = { route: RouteProp<any, 'EventAnalytics'> };

const EventAnalyticsScreen: React.FC<Props> = ({ route }) => {
  const { eventId } = route.params;
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [eventId]);

  const fetchAnalytics = async () => {
    try {
      const data = await getEventAnalytics(eventId);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading fullScreen />;

  const StatCard = ({ icon, title, value, color }: any) => (
    <View style={[styles.statCard, shadows.sm]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eventTitle}>{analytics?.event?.title || 'Event'}</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard icon="eye-outline" title="Views" value={analytics?.views || 0} color={colors.primary} />
        <StatCard icon="people" title="Joined" value={analytics?.joins || 0} color={colors.success} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Age Distribution</Text>
        {Object.entries(analytics?.demographics?.ageGroups || {}).map(([age, count]: any) => (
          <View key={age} style={styles.barRow}>
            <Text style={styles.barLabel}>{age}</Text>
            <View style={styles.barContainer}>
              <View style={[styles.bar, { width: `${Math.min((count / analytics.joins) * 100, 100)}%` }]} />
            </View>
            <Text style={styles.barValue}>{count}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Interests</Text>
        <View style={styles.interestsRow}>
          {(analytics?.demographics?.topInterests || []).map((interest: string) => (
            <View key={interest} style={styles.interestChip}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  header: { backgroundColor: colors.primary, padding: spacing.lg },
  eventTitle: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textWhite },
  statsRow: { flexDirection: 'row', padding: spacing.md, gap: spacing.md },
  statCard: { flex: 1, backgroundColor: colors.background, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center' },
  statValue: { fontSize: fontSizes.xxl, fontWeight: fontWeights.bold, color: colors.text, marginTop: spacing.sm },
  statTitle: { fontSize: fontSizes.sm, color: colors.textLight },
  section: { backgroundColor: colors.background, margin: spacing.md, padding: spacing.md, borderRadius: borderRadius.lg },
  sectionTitle: { fontSize: fontSizes.md, fontWeight: fontWeights.semiBold, color: colors.text, marginBottom: spacing.md },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  barLabel: { width: 60, fontSize: fontSizes.sm, color: colors.text },
  barContainer: { flex: 1, height: 16, backgroundColor: colors.backgroundGray, borderRadius: 8, overflow: 'hidden' },
  bar: { height: '100%', backgroundColor: colors.primary },
  barValue: { width: 30, textAlign: 'right', fontSize: fontSizes.sm, color: colors.textLight },
  interestsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  interestChip: { backgroundColor: colors.primaryLight + '30', paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: borderRadius.full },
  interestText: { fontSize: fontSizes.sm, color: colors.primary },
});

export default EventAnalyticsScreen;
