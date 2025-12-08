import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../utils/theme';
import { Card } from '../components/Card';

type RouteParams = {
  InteractionDetail: {
    entryId: string;
  };
};

export const InteractionDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'InteractionDetail'>>();
  const { interactionLogs } = useAppStore();
  const entry = interactionLogs.find((log) => log.id === route.params.entryId);

  if (!entry) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.errorText}>Entry not found</Text>
        </Card>
      </ScrollView>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.date}>{formatDate(entry.timestamp)}</Text>
        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.label}>Type of Interaction</Text>
          <Text style={styles.value}>
            {entry.type.charAt(0).toUpperCase() + entry.type.slice(1).replace('-', ' ')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Initiated By</Text>
          <Text style={styles.value}>{entry.initiatedBy === 'me' ? 'Me' : 'Them'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>How I Felt</Text>
          <View style={styles.feelingsRow}>
            <View style={styles.feelingBox}>
              <Text style={styles.feelingLabel}>Before</Text>
              <Text style={styles.feelingValue}>{entry.feelingBefore}/10</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
            <View style={styles.feelingBox}>
              <Text style={styles.feelingLabel}>During</Text>
              <Text style={styles.feelingValue}>{entry.feelingDuring}/10</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
            <View style={styles.feelingBox}>
              <Text style={styles.feelingLabel}>After</Text>
              <Text style={styles.feelingValue}>{entry.feelingAfter}/10</Text>
            </View>
          </View>
        </View>

        {entry.redFlags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Red Flags Observed</Text>
            <View style={styles.redFlagsContainer}>
              {entry.redFlags.map((flag) => (
                <View key={flag} style={styles.redFlagTag}>
                  <Text style={styles.redFlagText}>
                    {flag.charAt(0).toUpperCase() + flag.slice(1).replace('-', ' ')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {entry.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.notes}>{entry.notes}</Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  date: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  value: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  feelingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feelingBox: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  feelingLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  feelingValue: {
    ...theme.typography.h3,
    color: theme.colors.primary,
  },
  arrow: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.xs,
  },
  redFlagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  redFlagTag: {
    backgroundColor: theme.colors.error + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  redFlagText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    fontWeight: '600',
  },
  notes: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 22,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
});
