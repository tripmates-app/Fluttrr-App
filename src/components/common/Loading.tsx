import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/typography';
import { spacing } from '../../constants/spacing';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
}

export const Loading: React.FC<LoadingProps> = ({
  message,
  fullScreen = false,
  size = 'large',
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  message: {
    marginTop: spacing.md,
    fontSize: fontSizes.md,
    color: colors.textLight,
    textAlign: 'center',
  },
});

export default Loading;
