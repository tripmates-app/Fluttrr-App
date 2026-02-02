import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../../types';
import { RootState } from '../../store';
import { Button, Input, Chip } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { interests, lookingForOptions } from '../../constants/categories';
import { updateUserProfile, uploadProfilePhoto } from '../../services/userService';
import { updateUser } from '../../store/slices/authSlice';

type EditProfileScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;
};

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [photos, setPhotos] = useState<string[]>(user?.profilePhotos || []);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);
  const [lookingFor, setLookingFor] = useState(user?.lookingFor || 'open_to_all');
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0] && photos.length < 6) {
      setPhotos([...photos, result.assets[0].uri]);
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
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Upload new photos
      const uploadedPhotos: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        if (photos[i].startsWith('http')) {
          uploadedPhotos.push(photos[i]);
        } else {
          const url = await uploadProfilePhoto(user.userId, photos[i], i);
          uploadedPhotos.push(url);
        }
      }

      await updateUserProfile(user.userId, {
        displayName,
        bio,
        profilePhotos: uploadedPhotos,
        interests: selectedInterests,
        lookingFor,
      });

      dispatch(updateUser({
        displayName,
        bio,
        profilePhotos: uploadedPhotos,
        interests: selectedInterests,
        lookingFor,
      }));

      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Photos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photos</Text>
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
                  <View style={styles.removeButton}>
                    <Ionicons name="close" size={14} color={colors.textWhite} />
                  </View>
                </>
              ) : (
                <Ionicons name="add" size={24} color={colors.textLight} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <Input
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your name"
        />
        <Input
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself..."
          multiline
          numberOfLines={4}
          maxLength={250}
        />
        <Text style={styles.charCount}>{bio.length}/250</Text>
      </View>

      {/* Looking For */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Looking For</Text>
        <View style={styles.optionsGrid}>
          {lookingForOptions.map((option) => (
            <Chip
              key={option.id}
              label={option.label}
              selected={lookingFor === option.id}
              onPress={() => setLookingFor(option.id)}
              style={styles.chip}
            />
          ))}
        </View>
      </View>

      {/* Interests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interests (up to 10)</Text>
        <View style={styles.interestsGrid}>
          {interests.map((interest) => (
            <Chip
              key={interest}
              label={interest}
              selected={selectedInterests.includes(interest)}
              onPress={() => toggleInterest(interest)}
              size="small"
              style={styles.interestChip}
            />
          ))}
        </View>
      </View>

      {/* Save Button */}
      <Button
        title="Save Changes"
        onPress={handleSave}
        loading={isLoading}
        fullWidth
        style={styles.saveButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  photoSlot: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundGray,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  charCount: {
    fontSize: fontSizes.xs,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: -spacing.sm,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {},
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  interestChip: {},
  saveButton: {
    marginBottom: spacing.xxl,
  },
});

export default EditProfileScreen;
