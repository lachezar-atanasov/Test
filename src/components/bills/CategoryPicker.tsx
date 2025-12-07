import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme, Surface, Modal, Portal, IconButton } from 'react-native-paper';
import { BillCategory } from '../../types/database';
import { spacing, borderRadius } from '../../theme';
import { t } from '../../i18n';

interface CategoryPickerProps {
  categories: BillCategory[];
  selectedId?: string;
  onSelect: (category: BillCategory) => void;
  visible: boolean;
  onDismiss: () => void;
}

export function CategoryPicker({
  categories,
  selectedId,
  onSelect,
  visible,
  onDismiss,
}: CategoryPickerProps) {
  const theme = useTheme();

  const handleSelect = (category: BillCategory) => {
    onSelect(category);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('billForm.selectCategory')}
          </Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.grid}>
            {categories.map(category => {
              const isSelected = category.id === selectedId;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    { borderColor: isSelected ? category.color : theme.colors.outlineVariant },
                    isSelected && { backgroundColor: `${category.color}15` },
                  ]}
                  onPress={() => handleSelect(category)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
                    <Text style={styles.iconText}>{getCategoryIcon(category.icon)}</Text>
                  </View>
                  <Text
                    style={[
                      styles.categoryName,
                      { color: isSelected ? category.color : theme.colors.onSurface },
                    ]}
                    numberOfLines={2}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

function getCategoryIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    lightning: '⚡',
    'lightning-bolt': '⚡',
    fire: '🔥',
    water: '💧',
    'water-drop': '💧',
    wifi: '📶',
    internet: '🌐',
    phone: '📱',
    home: '🏠',
    'home-outline': '🏠',
    tag: '🏷️',
    receipt: '🧾',
    cash: '💰',
    'help-circle': '❓',
    other: '📋',
  };
  return iconMap[icon] || '📋';
}

interface CategoryChipProps {
  category: BillCategory | null;
  onPress: () => void;
  placeholder?: string;
}

export function CategoryChip({ category, onPress, placeholder }: CategoryChipProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          borderColor: category?.color || theme.colors.outline,
          backgroundColor: category ? `${category.color}10` : 'transparent',
        },
      ]}
      onPress={onPress}
    >
      {category ? (
        <>
          <View style={[styles.chipIcon, { backgroundColor: category.color }]}>
            <Text style={styles.chipIconText}>{getCategoryIcon(category.icon)}</Text>
          </View>
          <Text style={[styles.chipText, { color: category.color }]}>{category.name}</Text>
        </>
      ) : (
        <Text style={[styles.chipPlaceholder, { color: theme.colors.onSurfaceVariant }]}>
          {placeholder || t('billForm.selectCategory')}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    borderRadius: borderRadius.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    padding: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    padding: spacing.sm,
    borderWidth: 2,
    borderRadius: borderRadius.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconText: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.full,
  },
  chipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  chipIconText: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipPlaceholder: {
    fontSize: 14,
  },
});
