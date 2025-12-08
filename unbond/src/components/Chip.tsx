// ===================================
// Unbond - Chip Component
// ===================================

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../utils/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium';
  icon?: string;
}

export function Chip({
  label,
  selected = false,
  onPress,
  style,
  variant = 'default',
  size = 'medium',
  icon,
}: ChipProps) {
  const chipStyles = [
    styles.chip,
    styles[size],
    selected && styles.selected,
    variant !== 'default' && styles[variant],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    selected && styles.selectedText,
    variant !== 'default' && styles[`${variant}Text`],
  ];

  const content = (
    <>
      {icon && <Text style={textStyles}>{icon} </Text>}
      <Text style={textStyles}>{label}</Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          ...chipStyles,
          pressed && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable style={chipStyles} disabled>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // Sizes
  small: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  medium: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  
  // Selected state
  selected: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  selectedText: {
    color: colors.primaryDark,
  },
  
  // Variants
  primary: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  success: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  warning: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
  },
  error: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  
  // Text
  text: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  primaryText: {
    color: colors.primaryDark,
  },
  successText: {
    color: colors.success,
  },
  warningText: {
    color: colors.textPrimary,
  },
  errorText: {
    color: colors.error,
  },
  
  pressed: {
    opacity: 0.7,
  },
});
