import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, shadows } from '../../constants/spacing';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: boolean;
  shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  padding = true,
  shadow = true,
}) => {
  const cardStyles = [
    styles.card,
    padding && styles.padding,
    shadow && shadows.md,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  padding: {
    padding: spacing.md,
  },
});

export default Card;
