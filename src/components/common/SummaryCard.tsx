import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function SummaryCard({ title, value, subtitle, color, icon, style }: SummaryCardProps) {
  const theme = useTheme();
  const accentColor = color || theme.colors.primary;

  return (
    <Surface style={[styles.container, style]} elevation={1}>
      <View style={[styles.indicator, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>{title}</Text>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
        </View>
        <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  indicator: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconContainer: {
    marginLeft: spacing.sm,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 12,
  },
});
