import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { borderRadius } from '../../constants/spacing';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showOnline?: boolean;
  isOnline?: boolean;
  style?: ViewStyle;
}

const sizes = {
  small: 32,
  medium: 48,
  large: 64,
  xlarge: 100,
};

const fontSizeMap = {
  small: fontSizes.xs,
  medium: fontSizes.md,
  large: fontSizes.xl,
  xlarge: fontSizes.xxxl,
};

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 'medium',
  showOnline = false,
  isOnline = false,
  style,
}) => {
  const dimension = sizes[size];
  const fontSize = fontSizeMap[size];

  const getInitials = (name: string): string => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <View
      style={[
        styles.container,
        { width: dimension, height: dimension, borderRadius: dimension / 2 },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{getInitials(name || '')}</Text>
        </View>
      )}
      {showOnline && (
        <View
          style={[
            styles.onlineIndicator,
            { backgroundColor: isOnline ? colors.online : colors.offline },
            size === 'small' && styles.onlineIndicatorSmall,
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: colors.backgroundGray,
  },
  placeholder: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.textWhite,
    fontWeight: fontWeights.semiBold,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.background,
  },
  onlineIndicatorSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
});

export default Avatar;
