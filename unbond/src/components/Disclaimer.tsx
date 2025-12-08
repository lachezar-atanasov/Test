import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { Card } from './Card';

export const Disclaimer: React.FC = () => {
  return (
    <Card style={styles.disclaimer}>
      <Text style={styles.title}>Important Disclaimer</Text>
      <Text style={styles.text}>
        This app is NOT a substitute for professional mental health care. If you are in danger or
        experiencing severe distress, contact local emergency services or a licensed professional.
      </Text>
      <Text style={styles.text}>
        This app provides educational resources, tracking tools, and support strategies. It does not
        provide diagnosis, treatment, or crisis intervention.
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  disclaimer: {
    backgroundColor: theme.colors.accent + '20',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  text: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
});
