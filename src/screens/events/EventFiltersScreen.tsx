import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import Slider from '@react-native-community/slider';
import { EventsStackParamList } from '../../types';
import { RootState } from '../../store';
import { Button, Chip } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { eventCategories, priceOptions, ageRestrictions } from '../../constants/categories';
import { setFilters, clearFilters, setSortBy } from '../../store/slices/eventsSlice';

type EventFiltersScreenProps = {
  navigation: NativeStackNavigationProp<EventsStackParamList, 'Filters'>;
};

const EventFiltersScreen: React.FC<EventFiltersScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { filters, sortBy } = useSelector((state: RootState) => state.events);

  const [distance, setDistance] = useState(filters.distance || 25);
  const [category, setCategory] = useState(filters.category || '');
  const [price, setPrice] = useState(filters.price || '');
  const [ageRestriction, setAgeRestriction] = useState(filters.ageRestriction || '');
  const [sort, setSort] = useState(sortBy);

  const handleApply = () => {
    dispatch(setFilters({
      ...filters,
      distance,
      category: category || undefined,
      price: price || undefined,
      ageRestriction: ageRestriction || undefined,
    }));
    dispatch(setSortBy(sort));
    navigation.goBack();
  };

  const handleReset = () => {
    setDistance(25);
    setCategory('');
    setPrice('');
    setAgeRestriction('');
    setSort('date');
    dispatch(clearFilters());
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Distance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance</Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={distance}
              onValueChange={setDistance}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <Text style={styles.sliderValue}>{distance} miles</Text>
          </View>
        </View>

        {/* Sort By */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          <View style={styles.optionsRow}>
            {[
              { id: 'date', label: 'Date' },
              { id: 'distance', label: 'Distance' },
              { id: 'popularity', label: 'Popularity' },
            ].map((option) => (
              <Chip
                key={option.id}
                label={option.label}
                selected={sort === option.id}
                onPress={() => setSort(option.id as any)}
                style={styles.chip}
              />
            ))}
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.optionsGrid}>
            <Chip
              label="All"
              selected={category === ''}
              onPress={() => setCategory('')}
              style={styles.chip}
            />
            {eventCategories.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.label}
                selected={category === cat.id}
                onPress={() => setCategory(cat.id)}
                style={styles.chip}
              />
            ))}
          </View>
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price</Text>
          <View style={styles.optionsRow}>
            <Chip
              label="All"
              selected={price === ''}
              onPress={() => setPrice('')}
              style={styles.chip}
            />
            {priceOptions.map((option) => (
              <Chip
                key={option.id}
                label={option.label}
                selected={price === option.id}
                onPress={() => setPrice(option.id)}
                style={styles.chip}
              />
            ))}
          </View>
        </View>

        {/* Age Restriction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age Restriction</Text>
          <View style={styles.optionsRow}>
            <Chip
              label="All"
              selected={ageRestriction === ''}
              onPress={() => setAgeRestriction('')}
              style={styles.chip}
            />
            {ageRestrictions.map((option) => (
              <Chip
                key={option.id}
                label={option.label}
                selected={ageRestriction === option.id}
                onPress={() => setAgeRestriction(option.id)}
                style={styles.chip}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          title="Reset"
          onPress={handleReset}
          variant="outline"
          style={styles.resetButton}
        />
        <Button
          title="Apply Filters"
          onPress={handleApply}
          style={styles.applyButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sliderContainer: {
    paddingHorizontal: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    textAlign: 'center',
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
    marginTop: spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    marginBottom: spacing.xs,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});

export default EventFiltersScreen;
