// ===================================
// Unbond - Emotional Log Detail Screen
// ===================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import { Button, Input, Slider, Card, ScreenWrapper } from '../../components';
import { useEmotionalLogStore } from '../../store';
import { EMOTION_OPTIONS } from '../../utils/constants';
import { formatDateTime } from '../../utils/helpers';
import type { RootStackParamList, EmotionType } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'EmotionalLogDetail'>;

export function EmotionalLogDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { entryId } = route.params || {};

  const { entries, addEntry, updateEntry, deleteEntry } = useEmotionalLogStore();

  const existingEntry = entryId
    ? entries.find((e) => e.id === entryId)
    : undefined;

  const [cravingIntensity, setCravingIntensity] = useState(
    existingEntry?.cravingIntensity || 5
  );
  const [emotion, setEmotion] = useState<EmotionType>(
    existingEntry?.emotion || 'longing'
  );
  const [note, setNote] = useState(existingEntry?.note || '');

  const isEditing = !!existingEntry;

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Entry' : 'New Entry',
    });
  }, [navigation, isEditing]);

  const handleSave = async () => {
    if (isEditing && existingEntry) {
      await updateEntry(existingEntry.id, {
        cravingIntensity,
        emotion,
        note: note.trim() || undefined,
      });
    } else {
      await addEntry({
        cravingIntensity,
        emotion,
        note: note.trim() || undefined,
      });
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (existingEntry) {
              await deleteEntry(existingEntry.id);
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper keyboardAvoiding>
      {isEditing && existingEntry && (
        <Text style={styles.dateText}>
          {formatDateTime(existingEntry.createdAt)}
        </Text>
      )}

      {/* Craving Intensity */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Craving Intensity</Text>
        <Text style={styles.sectionSubtitle}>
          How strong is the urge to reach out?
        </Text>
        <Slider
          value={cravingIntensity}
          onChange={setCravingIntensity}
          min={1}
          max={10}
          lowLabel="Manageable"
          highLabel="Overwhelming"
        />
      </Card>

      {/* Emotion Selection */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Main Emotion</Text>
        <Text style={styles.sectionSubtitle}>
          What are you feeling most strongly?
        </Text>
        <View style={styles.emotionGrid}>
          {EMOTION_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.emotionOption,
                emotion === option.value && styles.emotionSelected,
              ]}
              onPress={() => setEmotion(option.value)}
            >
              <Text style={styles.emotionEmoji}>{option.emoji}</Text>
              <Text
                style={[
                  styles.emotionLabel,
                  emotion === option.value && styles.emotionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Notes */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Notes (Optional)</Text>
        <Text style={styles.sectionSubtitle}>
          What triggered this? What's going through your mind?
        </Text>
        <Input
          value={note}
          onChangeText={setNote}
          placeholder="Write whatever you need to express..."
          multiline
          numberOfLines={4}
          containerStyle={styles.inputContainer}
        />
      </Card>

      {/* Validation message */}
      <View style={styles.validationCard}>
        <Text style={styles.validationText}>
          💙 It's okay to feel this way. Logging it is a brave step.
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title={isEditing ? 'Save Changes' : 'Save Entry'}
          onPress={handleSave}
          fullWidth
        />
        {isEditing && (
          <Button
            title="Delete Entry"
            onPress={handleDelete}
            variant="ghost"
            fullWidth
            textStyle={styles.deleteText}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emotionOption: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
    minWidth: '18%',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emotionSelected: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  emotionEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  emotionLabel: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emotionLabelSelected: {
    color: colors.primaryDark,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 0,
  },
  validationCard: {
    backgroundColor: colors.primaryFaded,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  validationText: {
    ...typography.body,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  deleteText: {
    color: colors.error,
  },
});
