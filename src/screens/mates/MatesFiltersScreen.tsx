import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import Slider from '@react-native-community/slider';
import { MatesStackParamList } from '../../types';
import { RootState } from '../../store';
import { Button, Chip } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import { interests, lookingForOptions, genderOptions } from '../../constants/categories';
import { setFilters, clearFilters } from '../../store/slices/usersSlice';

type MatesFiltersScreenProps = {
  navigation: NativeStackNavigationProp<MatesStackParamList, 'MatesFilters'>;
};

const MatesFiltersScreen: React.FC<MatesFiltersScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state: RootState) => state.users);

  const [distance, setDistance] = useState(filters.maxDistance || 25);
  const [minAge, setMinAge] = useState(filters.minAge || 18);
  const [maxAge, setMaxAge] = useState(filters.maxAge || 99);
  const [gender, setGender] = useState(filters.gender || 'all');
  const [lookingFor, setLookingFor] = useState(filters.lookingFor || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(filters.interests || []);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleApply = () => {
    dispatch(setFilters({
      maxDistance: distance,
      minAge,
      maxAge,
      gender: gender !== 'all' ? gender : undefined,
      lookingFor: lookingFor || undefined,
      interests: selectedInterests.length > 0 ? selectedInterests : undefined,
    }));
    navigation.goBack();
  };

  const handleReset = () => {
    setDistance(25);
    setMinAge(18);
    setMaxAge(99);
    setGender('all');
    setLookingFor('');
    setSelectedInterests([]);
    dispatch(clearFilters());
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Distance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance</Text>
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

        {/* Age Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age Range</Text>
          <View style={styles.ageRow}>
            <View style={styles.ageSliderContainer}>
              <Text style={styles.ageLabel}>Min: {minAge}</Text>
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={99}
                step={1}
                value={minAge}
                onValueChange={(val) => setMinAge(Math.min(val, maxAge - 1))}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
              />
            </View>
            <View style={styles.ageSliderContainer}>
              <Text style={styles.ageLabel}>Max: {maxAge}</Text>
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={99}
                step={1}
                value={maxAge}
                onValueChange={(val) => setMaxAge(Math.max(val, minAge + 1))}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
              />
            </View>
          </View>
        </View>

        {/* Gender */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Show Me</Text>
          <View style={styles.optionsRow}>
            <Chip
              label="Everyone"
              selected={gender === 'all'}
              onPress={() => setGender('all')}
            />
            {genderOptions.slice(0, 3).map((option) => (
              <Chip
                key={option.id}
                label={option.label}
                selected={gender === option.id}
                onPress={() => setGender(option.id)}
              />
            ))}
          </View>
        </View>

        {/* Looking For */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Looking For</Text>
          <View style={styles.optionsRow}>
            <Chip
              label="Any"
              selected={!lookingFor}
              onPress={() => setLookingFor('')}
            />
            {lookingForOptions.map((option) => (
              <Chip
                key={option.id}
                label={option.label}
                selected={lookingFor === option.id}
                onPress={() => setLookingFor(option.id)}
              />
            ))}
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.optionsGrid}>
            {interests.slice(0, 20).map((interest) => (
              <Chip
                key={interest}
                label={interest}
                selected={selectedInterests.includes(interest)}
                onPress={() => toggleInterest(interest)}
                size="small"
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
          title="Apply"
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
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    textAlign: 'center',
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
  ageRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  ageSliderContainer: {
    flex: 1,
  },
  ageLabel: {
    fontSize: fontSizes.sm,
    color: colors.textLight,
    marginBottom: spacing.xs,
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

export default MatesFiltersScreen;
