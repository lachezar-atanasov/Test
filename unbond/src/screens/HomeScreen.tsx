import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../utils/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { articles } from '../data/psychoeducation';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { emotionalLogs, interactionLogs, settings, lastContactDate } = useAppStore();
  const [todayInsight, setTodayInsight] = useState(articles[0]);

  useEffect(() => {
    // Pick a random article for today's insight
    const randomIndex = Math.floor(Math.random() * articles.length);
    setTodayInsight(articles[randomIndex]);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getDaysSinceLastContact = () => {
    if (!lastContactDate) return null;
    const diff = Math.floor((Date.now() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStreak = () => {
    const days = getDaysSinceLastContact();
    if (days === null) return 0;
    return days;
  };

  const getWeeklyMoodAverage = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentLogs = emotionalLogs.filter(
      (log) => new Date(log.timestamp) >= weekAgo
    );
    if (recentLogs.length === 0) return null;
    const sum = recentLogs.reduce((acc, log) => acc + log.intensity, 0);
    return Math.round(sum / recentLogs.length);
  };

  const daysSince = getDaysSinceLastContact();
  const streak = getStreak();
  const weeklyAvg = getWeeklyMoodAverage();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.subtitle}>How are you feeling today?</Text>
      </View>

      <View style={styles.quickActions}>
        <Button
          title="Log Interaction"
          onPress={() => {
            // @ts-ignore - nested navigation
            (navigation as any).navigate('LogStack', { screen: 'InteractionLog' });
          }}
          variant="primary"
          style={styles.quickButton}
        />
        <Button
          title="Log Craving"
          onPress={() => {
            // @ts-ignore - nested navigation
            (navigation as any).navigate('LogStack', { screen: 'EmotionalLog' });
          }}
          variant="secondary"
          style={styles.quickButton}
        />
        <Button
          title="SOS Tools"
          onPress={() => {
            // @ts-ignore - nested navigation
            (navigation as any).getParent()?.navigate('Sos');
          }}
          variant="outline"
          style={styles.quickButton}
        />
      </View>

      <View style={styles.stats}>
        {daysSince !== null && (
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{daysSince}</Text>
            <Text style={styles.statLabel}>Days since last contact</Text>
          </Card>
        )}

        {streak > 0 && (
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>
              Day {settings?.contactMode === 'no-contact' ? 'no-contact' : 'low-contact'} streak
            </Text>
          </Card>
        )}

        {weeklyAvg !== null && (
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{weeklyAvg}/10</Text>
            <Text style={styles.statLabel}>Weekly craving average</Text>
          </Card>
        )}
      </View>

      <Card style={styles.insightCard}>
        <Text style={styles.insightTitle}>Today's Insight</Text>
        <Text style={styles.insightText}>{todayInsight.title}</Text>
        <TouchableOpacity
          onPress={() => {
            // @ts-ignore - nested navigation
            (navigation as any).navigate('LibraryStack', {
              screen: 'ArticleDetail',
              params: { articleId: todayInsight.id },
            });
          }}
        >
          <Text style={styles.readMore}>Read more →</Text>
        </TouchableOpacity>
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
  header: {
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  quickActions: {
    marginBottom: theme.spacing.lg,
  },
  quickButton: {
    marginBottom: theme.spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  statValue: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  insightCard: {
    marginBottom: theme.spacing.lg,
  },
  insightTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  insightText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 22,
  },
  readMore: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
