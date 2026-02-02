import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { auth } from '../../services/firebase';
import { updateUserProfile, uploadProfilePhoto } from '../../services/userService';
import { getUserProfile } from '../../services/authService';
import { setUser } from '../../store/slices/authSlice';
import { Button, Input, Chip } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { interests, genderOptions, lookingForOptions } from '../../constants/categories';
import { validateAge, validateBio } from '../../utils/validation';

const CreateProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Basic Info
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');

  // Step 2: Photos
  const [photos, setPhotos] = useState<string[]>([]);

  // Step 3: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState('open_to_all');

  const [errors, setErrors] = useState<{ age?: string; bio?: string }>({});

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (photos.length < 6) {
        setPhotos([...photos, result.assets[0].uri]);
      } else {
        Alert.alert('Limit Reached', 'You can only add up to 6 photos.');
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else if (selectedInterests.length < 10) {
      setSelectedInterests([...selectedInterests, interest]);
    } else {
      Alert.alert('Limit Reached', 'You can select up to 10 interests.');
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: typeof errors = {};

    const ageError = validateAge(age);
    if (ageError) newErrors.age = ageError;

    const bioError = validateBio(bio);
    if (bioError) newErrors.bio = bioError;

    if (!gender) {
      Alert.alert('Required', 'Please select your gender.');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (photos.length === 0) {
        Alert.alert('Add Photos', 'Please add at least one photo.');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (selectedInterests.length === 0) {
      Alert.alert('Select Interests', 'Please select at least one interest.');
      return;
    }

    setIsLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Not authenticated');

      // Upload photos
      const uploadedPhotos: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const url = await uploadProfilePhoto(userId, photos[i], i);
        uploadedPhotos.push(url);
      }

      // Update profile
      await updateUserProfile(userId, {
        age: parseInt(age, 10),
        gender,
        bio,
        profilePhotos: uploadedPhotos,
        interests: selectedInterests,
        lookingFor,
      });

      // Refresh user in state
      const updatedUser = await getUserProfile(userId);
      if (updatedUser) {
        dispatch(setUser(updatedUser));
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete profile');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>Tell us about yourself</Text>
      <Text style={styles.stepSubtitle}>
        This helps us personalize your experience.
      </Text>

      <Input
        label="Age"
        placeholder="Enter your age"
        value={age}
        onChangeText={setAge}
        keyboardType="number-pad"
        error={errors.age}
      />

      <Text style={styles.fieldLabel}>Gender</Text>
      <View style={styles.optionsGrid}>
        {genderOptions.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={gender === option.id}
            onPress={() => setGender(option.id)}
            style={styles.optionChip}
          />
        ))}
      </View>

      <Input
        label="Bio"
        placeholder="Write a short bio about yourself..."
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={4}
        maxLength={250}
        error={errors.bio}
        containerStyle={styles.bioInput}
      />
      <Text style={styles.charCount}>{bio.length}/250</Text>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>Add your photos</Text>
      <Text style={styles.stepSubtitle}>
        Add up to 6 photos. Your first photo will be your main profile picture.
      </Text>

      <View style={styles.photosGrid}>
        {[...Array(6)].map((_, index) => (
          <TouchableOpacity
            key={index}
            style={styles.photoSlot}
            onPress={photos[index] ? () => removePhoto(index) : pickImage}
          >
            {photos[index] ? (
              <>
                <Image source={{ uri: photos[index] }} style={styles.photo} />
                <View style={styles.removePhotoButton}>
                  <Ionicons name="close" size={16} color={colors.textWhite} />
                </View>
                {index === 0 && (
                  <View style={styles.mainPhotoBadge}>
                    <Text style={styles.mainPhotoText}>Main</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.addPhotoPlaceholder}>
                <Ionicons name="add" size={32} color={colors.textLight} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>What are you interested in?</Text>
      <Text style={styles.stepSubtitle}>
        Select up to 10 interests. This helps us suggest events and people.
      </Text>

      <View style={styles.interestsContainer}>
        {interests.map((interest) => (
          <Chip
            key={interest}
            label={interest}
            selected={selectedInterests.includes(interest)}
            onPress={() => toggleInterest(interest)}
            style={styles.interestChip}
            size="small"
          />
        ))}
      </View>

      <Text style={[styles.fieldLabel, styles.lookingForLabel]}>
        What are you looking for?
      </Text>
      <View style={styles.optionsGrid}>
        {lookingForOptions.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={lookingFor === option.id}
            onPress={() => setLookingFor(option.id)}
            style={styles.optionChip}
          />
        ))}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressBar}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                s <= step && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.content}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </View>

        <View style={styles.buttons}>
          {step > 1 && (
            <Button
              title="Back"
              onPress={handleBack}
              variant="outline"
              style={styles.backButton}
            />
          )}
          <Button
            title={step === 3 ? 'Complete Profile' : 'Continue'}
            onPress={step === 3 ? handleComplete : handleNext}
            loading={isLoading}
            style={styles.nextButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  content: {
    flex: 1,
  },
  stepTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: fontSizes.md,
    color: colors.textLight,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  fieldLabel: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: fontWeights.medium,
    marginBottom: spacing.sm,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  optionChip: {
    marginBottom: spacing.xs,
  },
  bioInput: {
    marginTop: spacing.md,
  },
  charCount: {
    fontSize: fontSizes.xs,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: -spacing.sm,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  photoSlot: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.backgroundGray,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  addPhotoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
  },
  removePhotoButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainPhotoBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  mainPhotoText: {
    fontSize: fontSizes.xs,
    color: colors.textWhite,
    fontWeight: fontWeights.semiBold,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  interestChip: {
    marginBottom: spacing.xs,
  },
  lookingForLabel: {
    marginTop: spacing.md,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});

export default CreateProfileScreen;
