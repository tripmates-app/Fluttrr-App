import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Button, Input } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import { signUp, createUserProfile } from '../../services/authService';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateDisplayName,
} from '../../utils/validation';

type SignUpScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;
};

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    const nameError = validateDisplayName(displayName);
    if (nameError) newErrors.displayName = nameError;

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    const confirmError = validateConfirmPassword(password, confirmPassword);
    if (confirmError) newErrors.confirmPassword = confirmError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const user = await signUp(email, password, displayName);

      // Create basic user profile
      await createUserProfile(user.uid, {
        email,
        displayName,
      });

      // Navigate to complete profile
      navigation.navigate('CreateProfile');
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Fluttrr to discover events and meet amazing people in Kansas City.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your name"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              error={errors.displayName}
              leftIcon="person-outline"
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
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

            <Text style={styles.terms}>
              By signing up, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            <Button
              title="Create Account"
              onPress={handleSignUp}
              fullWidth
              size="large"
              loading={isLoading}
              style={styles.signUpButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  backText: {
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textLight,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  terms: {
    fontSize: fontSizes.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginVertical: spacing.md,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  signUpButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    fontSize: fontSizes.md,
    color: colors.textLight,
  },
  footerLink: {
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
});

export default SignUpScreen;
