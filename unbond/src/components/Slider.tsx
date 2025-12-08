// ===================================
// Unbond - Slider Component
// ===================================
// A simple touch-based slider for intensity/mood selection

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { colors, borderRadius, spacing, typography } from '../utils/theme';
import { getIntensityColor } from '../utils/helpers';

interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  showLabels?: boolean;
  lowLabel?: string;
  highLabel?: string;
}

export function Slider({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  showLabels = true,
  lowLabel = 'Low',
  highLabel = 'High',
}: SliderProps) {
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.sliderContainer}>
        {range.map((num) => (
          <Pressable
            key={num}
            onPress={() => onChange(num)}
            style={[
              styles.dot,
              value === num && styles.dotSelected,
              value === num && { backgroundColor: getIntensityColor(num) },
            ]}
          >
            <Text
              style={[
                styles.dotText,
                value === num && styles.dotTextSelected,
              ]}
            >
              {num}
            </Text>
          </Pressable>
        ))}
      </View>

      {showLabels && (
        <View style={styles.labelsRow}>
          <Text style={styles.rangeLabel}>{lowLabel}</Text>
          <Text style={styles.rangeLabel}>{highLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dotSelected: {
    borderColor: colors.primaryDark,
    transform: [{ scale: 1.15 }],
  },
  dotText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  dotTextSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  rangeLabel: {
    ...typography.small,
    color: colors.textLight,
  },
});
