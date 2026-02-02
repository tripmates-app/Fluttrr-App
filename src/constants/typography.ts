import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

export const typography = StyleSheet.create({
  h1: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  h2: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  h3: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  h4: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  body: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    color: colors.text,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    color: colors.text,
  },
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    color: colors.textLight,
  },
  button: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.textWhite,
  },
  link: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.primary,
  },
});
