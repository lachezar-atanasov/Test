// ===================================
// Unbond - Article Detail Screen
// ===================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import { Card, ScreenWrapper } from '../../components';
import { articles } from '../../data/psychoeducation';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'ArticleDetail'>;

export function ArticleDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { articleId } = route.params;

  const article = articles.find((a) => a.id === articleId);

  useEffect(() => {
    if (article) {
      navigation.setOptions({ title: article.title });
    }
  }, [navigation, article]);

  if (!article) {
    return (
      <ScreenWrapper>
        <Text style={styles.errorText}>Article not found</Text>
      </ScreenWrapper>
    );
  }

  // Parse content with basic formatting
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Handle bold text
      const boldPattern = /\*\*(.*?)\*\*/g;
      let hasFormatting = boldPattern.test(line);
      boldPattern.lastIndex = 0;

      // Headers
      if (line.startsWith('**') && line.endsWith('**')) {
        const text = line.replace(/\*\*/g, '');
        return (
          <Text key={index} style={styles.contentHeader}>
            {text}
          </Text>
        );
      }

      // Bullet points
      if (line.startsWith('• ') || line.startsWith('- ')) {
        const text = line.substring(2).replace(/\*\*/g, '');
        return (
          <View key={index} style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{text}</Text>
          </View>
        );
      }

      // Numbered items
      const numberedMatch = line.match(/^(\d+)\)\s*(.*)$/);
      if (numberedMatch) {
        return (
          <View key={index} style={styles.bulletPoint}>
            <Text style={styles.bullet}>{numberedMatch[1]}.</Text>
            <Text style={styles.bulletText}>
              {numberedMatch[2].replace(/\*\*/g, '')}
            </Text>
          </View>
        );
      }

      // Regular paragraph
      if (line.trim()) {
        // Handle inline bold
        if (hasFormatting) {
          const parts = line.split(boldPattern);
          const boldMatches = [...line.matchAll(/\*\*(.*?)\*\*/g)].map(m => m[1]);
          let boldIndex = 0;
          
          return (
            <Text key={index} style={styles.paragraph}>
              {parts.map((part, partIndex) => {
                if (boldMatches.includes(part)) {
                  return (
                    <Text key={partIndex} style={styles.bold}>
                      {part}
                    </Text>
                  );
                }
                return part;
              })}
            </Text>
          );
        }
        return (
          <Text key={index} style={styles.paragraph}>
            {line}
          </Text>
        );
      }

      // Empty line - add spacing
      return <View key={index} style={styles.spacer} />;
    });
  };

  return (
    <ScreenWrapper>
      {/* Key Points */}
      {article.keyPoints.length > 0 && (
        <Card style={styles.keyPointsCard}>
          <Text style={styles.keyPointsTitle}>📌 Key Points</Text>
          {article.keyPoints.map((point, index) => (
            <View key={index} style={styles.keyPoint}>
              <Text style={styles.keyPointBullet}>•</Text>
              <Text style={styles.keyPointText}>{point}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Main content */}
      <View style={styles.contentContainer}>{renderContent(article.content)}</View>

      {/* Remember box */}
      {article.rememberBox && (
        <Card style={styles.rememberCard}>
          <Text style={styles.rememberTitle}>💙 Remember</Text>
          <Text style={styles.rememberText}>{article.rememberBox}</Text>
        </Card>
      )}

      {/* Disclaimer */}
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          This content is educational and not a substitute for professional
          mental health care. If you're struggling, please reach out to a
          qualified professional.
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  keyPointsCard: {
    backgroundColor: colors.primaryFaded,
    marginBottom: spacing.lg,
  },
  keyPointsTitle: {
    ...typography.heading3,
    color: colors.primaryDark,
    marginBottom: spacing.md,
  },
  keyPoint: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  keyPointBullet: {
    ...typography.body,
    color: colors.primaryDark,
    marginRight: spacing.sm,
  },
  keyPointText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  contentContainer: {
    marginBottom: spacing.lg,
  },
  contentHeader: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  paragraph: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  bold: {
    fontWeight: '600',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
  },
  bullet: {
    ...typography.body,
    color: colors.primary,
    marginRight: spacing.sm,
    fontWeight: '600',
  },
  bulletText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  spacer: {
    height: spacing.sm,
  },
  rememberCard: {
    backgroundColor: colors.accentLight,
    marginBottom: spacing.lg,
  },
  rememberTitle: {
    ...typography.heading3,
    color: colors.accentDark,
    marginBottom: spacing.sm,
  },
  rememberText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  disclaimerContainer: {
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  disclaimerText: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
