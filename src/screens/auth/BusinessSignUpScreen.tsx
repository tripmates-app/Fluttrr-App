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
import { Picker } from '@react-native-picker/picker';
import { signUp, createBusinessProfile } from '../../services/authService';
import { uploadBusinessPhoto } from '../../services/businessService';
import { Button, Input } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { businessCategories } from '../../constants/categories';
import {
  validateEmail,
  validatePassword,
  validateBusinessName,
  validateBusinessDescription,
  validatePhoneNumber,
  validateAddress,
} from '../../utils/validation';

type BusinessSignUpScreenProps = {
  navigation: any;
};

const BusinessSignUpScreen: React.FC<BusinessSignUpScreenProps> = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Account Info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Business Info
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');

  // Step 3: Photos
  const [photos, setPhotos] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (photos.length < 6) {
        setPhotos([...photos, result.assets[0].uri]);
      } else {
        Alert.alert('Limit Reached', 'You can add up to 6 photos.');
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameError = validateBusinessName(businessName);
    if (nameError) newErrors.businessName = nameError;

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    const descError = validateBusinessDescription(description);
    if (descError) newErrors.description = descError;

    const addressError = validateAddress(address);
    if (addressError) newErrors.address = addressError;

    const phoneError = validatePhoneNumber(phone);
    if (phoneError) newErrors.phone = phoneError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleComplete = async () => {
    if (photos.length === 0) {
      Alert.alert('Add Photos', 'Please add at least one photo of your business.');
      return;
    }

    setIsLoading(true);
    try {
      // Create account
      const user = await signUp(email, password, businessName);

      // Upload photos
      const uploadedPhotos: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const url = await uploadBusinessPhoto(user.uid, photos[i], i);
        uploadedPhotos.push(url);
      }

      // Create business profile
      await createBusinessProfile(user.uid, {
        email,
        businessName,
        category,
        description,
        address,
        phone,
        website,
        socialLinks: {
          instagram: instagram || undefined,
          facebook: facebook || undefined,
        },
        photos: uploadedPhotos,
        location: {
          latitude: 39.0997, // Default to KC - would use geocoding in production
          longitude: -94.5786,
        },
      });

      Alert.alert(
        'Registration Submitted',
        'Your business registration is pending verification. You will be notified within 24-48 hours.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to register business');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>Create Business Account</Text>
      <Text style={styles.stepSubtitle}>
        Set up your login credentials for your business account.
      </Text>

      <Input
        label="Business Email"
        placeholder="Enter business email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
        leftIcon="mail-outline"
      />

      <Input
        label="Password"
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
        leftIcon="lock-closed-outline"
      />

      <Input
        label="Confirm Password"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        error={errors.confirmPassword}
        leftIcon="lock-closed-outline"
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>Business Information</Text>
      <Text style={styles.stepSubtitle}>
        Tell us about your business.
      </Text>

      <Input
        label="Business Name"
        placeholder="Enter business name"
        value={businessName}
        onChangeText={setBusinessName}
        error={errors.businessName}
        leftIcon="business-outline"
      />

      <Text style={styles.fieldLabel}>Category</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={setCategory}
          style={styles.picker}
        >
          <Picker.Item label="Select a category" value="" />
          {businessCategories.map((cat) => (
            <Picker.Item key={cat.id} label={cat.label} value={cat.id} />
          ))}
        </Picker>
      </View>
      {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

      <Input
        label="Description"
        placeholder="Describe your business..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        maxLength={500}
        error={errors.description}
      />
      <Text style={styles.charCount}>{description.length}/500</Text>

      <Input
        label="Address"
        placeholder="Business address"
        value={address}
        onChangeText={setAddress}
        error={errors.address}
        leftIcon="location-outline"
      />

      <Input
        label="Phone Number"
        placeholder="Business phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        error={errors.phone}
        leftIcon="call-outline"
      />

      <Input
        label="Website (optional)"
        placeholder="https://..."
        value={website}
        onChangeText={setWebsite}
        keyboardType="url"
        autoCapitalize="none"
        leftIcon="globe-outline"
      />

      <Input
        label="Instagram (optional)"
        placeholder="@yourbusiness"
        value={instagram}
        onChangeText={setInstagram}
        autoCapitalize="none"
        leftIcon="logo-instagram"
      />

      <Input
        label="Facebook (optional)"
        placeholder="Facebook page URL"
        value={facebook}
        onChangeText={setFacebook}
        autoCapitalize="none"
        leftIcon="logo-facebook"
      />
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>Business Photos</Text>
      <Text style={styles.stepSubtitle}>
        Add photos of your business. The first photo will be your cover image.
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
                  <View style={styles.coverBadge}>
                    <Text style={styles.coverText}>Cover</Text>
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

      <View style={styles.verificationNote}>
        <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
        <Text style={styles.verificationText}>
          Your business will be verified within 24-48 hours. You&apos;ll be notified once approved.
        </Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
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
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </View>

        <View style={styles.buttons}>
          <Button
            title={step === 3 ? 'Submit Registration' : 'Continue'}
            onPress={step === 3 ? handleComplete : handleNext}
            fullWidth
            size="large"
            loading={isLoading}
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
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  progressBar: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  pickerContainer: {
    backgroundColor: colors.backgroundGray,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  errorText: {
    fontSize: fontSizes.xs,
    color: colors.error,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  charCount: {
    fontSize: fontSizes.xs,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  photoSlot: {
    width: '30%',
    aspectRatio: 16 / 9,
    borderRadius: borderRadius.md,
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
    borderRadius: borderRadius.md,
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
  coverBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  coverText: {
    fontSize: fontSizes.xs,
    color: colors.textWhite,
    fontWeight: fontWeights.semiBold,
  },
  verificationNote: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight + '20',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  verificationText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  buttons: {
    marginTop: spacing.xl,
  },
});

export default BusinessSignUpScreen;
