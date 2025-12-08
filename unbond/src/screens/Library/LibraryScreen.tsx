// ===================================
// Unbond - Library Screen
// ===================================

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import { Card, Chip, EmptyState } from '../../components';
import { articles, searchArticles } from '../../data/psychoeducation';
import { truncateText } from '../../utils/helpers';
import type { RootStackParamList, Article, ArticleCategory } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES: Array<{ value: ArticleCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'understanding', label: 'Understanding' },
  { value: 'patterns', label: 'Patterns' },
  { value: 'leaving', label: 'Leaving' },
  { value: 'contact-strategies', label: 'Contact' },
  { value: 'attachment', label: 'Attachment' },
  { value: 'healing', label: 'Healing' },
];

export function LibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    ArticleCategory | 'all'
  >('all');

  const filteredArticles = useMemo(() => {
    let result = articles;

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((article) => article.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = searchArticles(searchQuery);
      if (selectedCategory !== 'all') {
        result = result.filter(
          (article) => article.category === selectedCategory
        );
      }
    }

    return result;
  }, [searchQuery, selectedCategory]);

  const getCategoryIcon = (category: ArticleCategory): string => {
    const icons: Record<ArticleCategory, string> = {
      understanding: '🧠',
      patterns: '🔄',
      leaving: '🚪',
      'contact-strategies': '📵',
      attachment: '💔',
      healing: '🌱',
    };
    return icons[category];
  };

  const renderArticle = ({ item }: { item: Article }) => (
    <Card
      style={styles.articleCard}
      onPress={() => navigation.navigate('ArticleDetail', { articleId: item.id })}
    >
      <View style={styles.articleHeader}>
        <Text style={styles.articleIcon}>{getCategoryIcon(item.category)}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {CATEGORIES.find((c) => c.value === item.category)?.label}
          </Text>
        </View>
      </View>
      <Text style={styles.articleTitle}>{item.title}</Text>
      <Text style={styles.articlePreview}>
        {truncateText(item.content.replace(/\*\*/g, '').replace(/\n/g, ' '), 120)}
      </Text>
      <Text style={styles.readMore}>Read more →</Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Category filters */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <Chip
            label={item.label}
            selected={selectedCategory === item.value}
            onPress={() => setSelectedCategory(item.value)}
            style={styles.categoryChip}
          />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      />

      {/* Articles list */}
      <FlatList
        data={filteredArticles}
        keyExtractor={(item) => item.id}
        renderItem={renderArticle}
        contentContainerStyle={[
          styles.listContent,
          filteredArticles.length === 0 && styles.emptyContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="📚"
            title="No Articles Found"
            message={
              searchQuery
                ? 'Try a different search term or category.'
                : 'No articles available in this category.'
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    color: colors.textPrimary,
  },
  clearButton: {
    marginLeft: spacing.sm,
    padding: spacing.sm,
  },
  clearButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  categoriesContainer: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    marginRight: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  emptyContainer: {
    flex: 1,
  },
  articleCard: {
    marginBottom: spacing.md,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  articleIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    ...typography.small,
    color: colors.primaryDark,
  },
  articleTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  articlePreview: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  readMore: {
    ...typography.bodyMedium,
    color: colors.primary,
    marginTop: spacing.sm,
  },
});
