import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store';
import { Review } from '../../types';
import { Avatar, Loading, EmptyState, Button, Input } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { getBusinessReviews, respondToReview } from '../../services/businessService';
import { formatTimeAgo } from '../../utils/dateTime';

const BusinessReviewsScreen: React.FC = () => {
  const { business } = useSelector((state: RootState) => state.auth);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [business]);

  const fetchReviews = async () => {
    if (!business) return;
    try {
      const fetchedReviews = await getBusinessReviews(business.businessId);
      setReviews(fetchedReviews);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (reviewId: string) => {
    if (!responseText.trim()) return;
    try {
      await respondToReview(reviewId, responseText);
      setRespondingTo(null);
      setResponseText('');
      fetchReviews();
    } catch (err) {
      console.error('Failed to respond:', err);
    }
  };

  const renderStars = (rating: number) => (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons key={star} name={star <= rating ? 'star' : 'star-outline'} size={16} color={colors.warning} />
      ))}
    </View>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Avatar uri={item.userPhoto} name={item.userName} size="small" />
        <View style={styles.reviewInfo}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.eventName}>on {item.businessName}</Text>
        </View>
        {renderStars(item.rating)}
      </View>
      <Text style={styles.reviewText}>{item.text}</Text>
      <Text style={styles.reviewTime}>{formatTimeAgo(item.createdAt)}</Text>

      {item.businessResponse ? (
        <View style={styles.response}>
          <Text style={styles.responseLabel}>Your response:</Text>
          <Text style={styles.responseText}>{item.businessResponse.text}</Text>
        </View>
      ) : respondingTo === item.reviewId ? (
        <View style={styles.respondForm}>
          <Input
            value={responseText}
            onChangeText={setResponseText}
            placeholder="Write your response..."
            multiline
          />
          <View style={styles.respondActions}>
            <Button title="Cancel" variant="ghost" size="small" onPress={() => setRespondingTo(null)} />
            <Button title="Submit" size="small" onPress={() => handleRespond(item.reviewId)} />
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.respondButton} onPress={() => setRespondingTo(item.reviewId)}>
          <Text style={styles.respondButtonText}>Respond</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.avgRating}>{business?.averageRating?.toFixed(1) || '0.0'}</Text>
        {renderStars(Math.round(business?.averageRating || 0))}
        <Text style={styles.totalReviews}>{reviews.length} reviews</Text>
      </View>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.reviewId}
        renderItem={renderReview}
        ListEmptyComponent={<EmptyState icon="star-outline" title="No reviews yet" message="Reviews from your events will appear here." />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  summary: { backgroundColor: colors.background, padding: spacing.lg, alignItems: 'center' },
  avgRating: { fontSize: 48, fontWeight: fontWeights.bold, color: colors.text },
  stars: { flexDirection: 'row', marginTop: spacing.sm },
  totalReviews: { fontSize: fontSizes.sm, color: colors.textLight, marginTop: spacing.sm },
  listContent: { padding: spacing.md },
  reviewCard: { backgroundColor: colors.background, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md },
  reviewHeader: { flexDirection: 'row', alignItems: 'center' },
  reviewInfo: { flex: 1, marginLeft: spacing.sm },
  userName: { fontSize: fontSizes.md, fontWeight: fontWeights.semiBold, color: colors.text },
  eventName: { fontSize: fontSizes.sm, color: colors.textLight },
  reviewText: { fontSize: fontSizes.md, color: colors.text, marginTop: spacing.sm, lineHeight: 22 },
  reviewTime: { fontSize: fontSizes.xs, color: colors.textLight, marginTop: spacing.sm },
  response: { backgroundColor: colors.backgroundGray, padding: spacing.sm, borderRadius: borderRadius.md, marginTop: spacing.sm },
  responseLabel: { fontSize: fontSizes.xs, color: colors.primary, fontWeight: fontWeights.semiBold },
  responseText: { fontSize: fontSizes.sm, color: colors.text, marginTop: spacing.xs },
  respondForm: { marginTop: spacing.sm },
  respondActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.sm },
  respondButton: { marginTop: spacing.sm },
  respondButtonText: { fontSize: fontSizes.sm, color: colors.primary, fontWeight: fontWeights.medium },
});

export default BusinessReviewsScreen;
