import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  size?: 'small' | 'medium';
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  onRemove,
  icon,
  style,
  size = 'medium',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected && styles.chipSelected,
        size === 'small' && styles.chipSmall,
        style,
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={size === 'small' ? 14 : 16}
          color={selected ? colors.textWhite : colors.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          selected && styles.labelSelected,
          size === 'small' && styles.labelSmall,
        ]}
      >
        {label}
      </Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Ionicons
            name="close"
            size={size === 'small' ? 14 : 16}
            color={selected ? colors.textWhite : colors.textLight}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipSmall: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },
  labelSelected: {
    color: colors.textWhite,
  },
  labelSmall: {
    fontSize: fontSizes.xs,
  },
  removeButton: {
    marginLeft: spacing.xs,
  },
});

export default Chip;
