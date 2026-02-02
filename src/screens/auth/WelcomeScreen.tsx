import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Button } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing } from '../../constants/spacing';

const { width, height } = Dimensions.get('window');

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>Fluttrr</Text>
          </View>
          <Text style={styles.tagline}>Connect. Discover. Meet.</Text>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Find Your Flock in{'\n'}Kansas City
          </Text>
          <Text style={styles.heroSubtitle}>
            Discover local events, meet like-minded people, and make meaningful connections in your community.
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={styles.featureText}>Discover local events</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureText}>Meet new people</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureText}>Chat with attendees</Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <Button
            title="Get Started"
            onPress={() => navigation.navigate('SignUp')}
            fullWidth
            size="large"
          />
          <Button
            title="I already have an account"
            onPress={() => navigation.navigate('Login')}
            variant="ghost"
            fullWidth
            size="large"
          />
          <View style={styles.businessLink}>
            <Text style={styles.businessText}>Are you a business? </Text>
            <Text
              style={styles.businessLinkText}
              onPress={() => navigation.navigate('BusinessSignUp')}
            >
              Register here
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 24,
    fontWeight: fontWeights.bold,
    color: colors.textWhite,
  },
  tagline: {
    fontSize: fontSizes.lg,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  heroTitle: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: fontSizes.md,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  featureText: {
    fontSize: fontSizes.sm,
    color: colors.text,
    textAlign: 'center',
    fontWeight: fontWeights.medium,
  },
  buttonsContainer: {
    gap: spacing.md,
  },
  businessLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  businessText: {
    fontSize: fontSizes.sm,
    color: colors.textLight,
  },
  businessLinkText: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
});

export default WelcomeScreen;
