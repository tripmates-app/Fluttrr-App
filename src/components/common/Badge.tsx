import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';

interface BadgeProps {
  count?: number;
  label?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  count,
  label,
  variant = 'primary',
  size = 'medium',
  style,
}) => {
  const displayText = label || (count !== undefined ? (count > 99 ? '99+' : count.toString()) : '');

  if (!displayText && count === undefined) return null;

  return (
    <View
      style={[
        styles.badge,
        styles[variant],
        styles[size],
        count !== undefined && !label && styles.countBadge,
        style,
      ]}
    >
      <Text style={[styles.text, styles[`${size}Text`]]}>{displayText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: spacing.xs,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primaryLight,
  },
  success: {
    backgroundColor: colors.success,
  },
  warning: {
    backgroundColor: colors.warning,
  },
  error: {
    backgroundColor: colors.error,
  },
  small: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  medium: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  text: {
    color: colors.textWhite,
    fontWeight: fontWeights.semiBold,
  },
  smallText: {
    fontSize: fontSizes.xs - 2,
  },
  mediumText: {
    fontSize: fontSizes.xs,
  },
});

export default Badge;
