import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { articles } from '../data/psychoeducation';
import { theme } from '../utils/theme';
import { Card } from '../components/Card';

type RouteParams = {
  ArticleDetail: {
    articleId: string;
  };
};

export const ArticleDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'ArticleDetail'>>();
  const article = articles.find((a) => a.id === route.params.articleId);

  if (!article) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Card>
          <Text style={styles.errorText}>Article not found</Text>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card>
        <Text style={styles.category}>{article.category}</Text>
        <Text style={styles.title}>{article.title}</Text>

        <View style={styles.contentSection}>
          <Text style={styles.content}>{article.content}</Text>
        </View>

        {article.keyPoints && article.keyPoints.length > 0 && (
          <View style={styles.keyPointsSection}>
            <Text style={styles.keyPointsTitle}>Key Points</Text>
            {article.keyPoints.map((point, index) => (
              <Text key={index} style={styles.keyPoint}>
                • {point}
              </Text>
            ))}
          </View>
        )}

        {article.remember && (
          <View style={styles.rememberSection}>
            <Text style={styles.rememberTitle}>Remember</Text>
            <Text style={styles.rememberText}>{article.remember}</Text>
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
  contentContainer: {
    padding: theme.spacing.md,
  },
  category: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  contentSection: {
    marginBottom: theme.spacing.lg,
  },
  content: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
  },
  keyPointsSection: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  keyPointsTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  keyPoint: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.xs,
  },
  rememberSection: {
    backgroundColor: theme.colors.accent + '20',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  rememberTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  rememberText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
});
