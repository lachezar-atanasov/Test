// ===================================
// Unbond - Interaction Detail Screen
// ===================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import { Button, Input, Slider, Card, ScreenWrapper } from '../../components';
import { useInteractionLogStore, useSettingsStore } from '../../store';
import { INTERACTION_TYPE_OPTIONS, RED_FLAG_OPTIONS } from '../../utils/constants';
import { formatDateTime, getTodayDate } from '../../utils/helpers';
import type {
  RootStackParamList,
  InteractionType,
  RedFlagType,
} from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'InteractionDetail'>;

export function InteractionDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { entryId } = route.params || {};

  const { entries, addEntry, updateEntry, deleteEntry } =
    useInteractionLogStore();
  const { updateSettings } = useSettingsStore();

  const existingEntry = entryId
    ? entries.find((e) => e.id === entryId)
    : undefined;

  const [interactionType, setInteractionType] = useState<InteractionType>(
    existingEntry?.interactionType || 'text'
  );
  const [initiatedBy, setInitiatedBy] = useState<'me' | 'them'>(
    existingEntry?.initiatedBy || 'them'
  );
  const [feelingBefore, setFeelingBefore] = useState(
    existingEntry?.feelingBefore || 5
  );
  const [feelingDuring, setFeelingDuring] = useState(
    existingEntry?.feelingDuring || 5
  );
  const [feelingAfter, setFeelingAfter] = useState(
    existingEntry?.feelingAfter || 5
  );
  const [redFlags, setRedFlags] = useState<RedFlagType[]>(
    existingEntry?.redFlags || []
  );
  const [note, setNote] = useState(existingEntry?.note || '');

  const isEditing = !!existingEntry;

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Interaction' : 'Log Interaction',
    });
  }, [navigation, isEditing]);

  const toggleRedFlag = (flag: RedFlagType) => {
    if (redFlags.includes(flag)) {
      setRedFlags(redFlags.filter((f) => f !== flag));
    } else {
      setRedFlags([...redFlags, flag]);
    }
  };

  const handleSave = async () => {
    if (isEditing && existingEntry) {
      await updateEntry(existingEntry.id, {
        interactionType,
        initiatedBy,
        feelingBefore,
        feelingDuring,
        feelingAfter,
        redFlags,
        note: note.trim() || undefined,
      });
    } else {
      await addEntry({
        interactionType,
        initiatedBy,
        feelingBefore,
        feelingDuring,
        feelingAfter,
        redFlags,
        note: note.trim() || undefined,
      });
      // Update last contact date
      await updateSettings({ lastContactDate: getTodayDate() });
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Interaction',
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

      {/* Interaction Type */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Type of Interaction</Text>
        <View style={styles.typeGrid}>
          {INTERACTION_TYPE_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.typeOption,
                interactionType === option.value && styles.typeSelected,
              ]}
              onPress={() => setInteractionType(option.value)}
            >
              <Text style={styles.typeIcon}>{option.icon}</Text>
              <Text
                style={[
                  styles.typeLabel,
                  interactionType === option.value && styles.typeLabelSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Who Initiated */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Who Initiated?</Text>
        <View style={styles.initiatorRow}>
          <Pressable
            style={[
              styles.initiatorOption,
              initiatedBy === 'me' && styles.initiatorSelected,
            ]}
            onPress={() => setInitiatedBy('me')}
          >
            <Text style={styles.initiatorEmoji}>🙋</Text>
            <Text
              style={[
                styles.initiatorLabel,
                initiatedBy === 'me' && styles.initiatorLabelSelected,
              ]}
            >
              I did
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.initiatorOption,
              initiatedBy === 'them' && styles.initiatorSelected,
            ]}
            onPress={() => setInitiatedBy('them')}
          >
            <Text style={styles.initiatorEmoji}>👤</Text>
            <Text
              style={[
                styles.initiatorLabel,
                initiatedBy === 'them' && styles.initiatorLabelSelected,
              ]}
            >
              They did
            </Text>
          </Pressable>
        </View>
      </Card>

      {/* Feelings */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>How Did You Feel?</Text>
        <Text style={styles.sectionSubtitle}>
          Rate your emotional state at each phase (1 = very bad, 10 = very good)
        </Text>
        <Slider
          label="Before the interaction"
          value={feelingBefore}
          onChange={setFeelingBefore}
          lowLabel="Terrible"
          highLabel="Great"
        />
        <Slider
          label="During the interaction"
          value={feelingDuring}
          onChange={setFeelingDuring}
          lowLabel="Terrible"
          highLabel="Great"
        />
        <Slider
          label="After the interaction"
          value={feelingAfter}
          onChange={setFeelingAfter}
          lowLabel="Terrible"
          highLabel="Great"
        />
      </Card>

      {/* Red Flags */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>🚩 Red Flags Observed</Text>
        <Text style={styles.sectionSubtitle}>
          Select any patterns you noticed
        </Text>
        <View style={styles.redFlagGrid}>
          {RED_FLAG_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.redFlagOption,
                redFlags.includes(option.value) && styles.redFlagSelected,
              ]}
              onPress={() => toggleRedFlag(option.value)}
            >
              <Text
                style={[
                  styles.redFlagLabel,
                  redFlags.includes(option.value) && styles.redFlagLabelSelected,
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
        <Input
          value={note}
          onChangeText={setNote}
          placeholder="What happened? How do you feel now?"
          multiline
          numberOfLines={4}
          containerStyle={styles.inputContainer}
        />
      </Card>

      {/* Info card */}
      {feelingAfter < feelingBefore && (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            💡 Your feeling decreased after contact. This is important data.
            Over time, you may notice patterns that help you make decisions.
          </Text>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title={isEditing ? 'Save Changes' : 'Log Interaction'}
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeOption: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
    minWidth: '30%',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeSelected: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  typeLabel: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: colors.primaryDark,
    fontWeight: '500',
  },
  initiatorRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  initiatorOption: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  initiatorSelected: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  initiatorEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  initiatorLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  initiatorLabelSelected: {
    color: colors.primaryDark,
    fontWeight: '500',
  },
  redFlagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  redFlagOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  redFlagSelected: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  redFlagLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  redFlagLabelSelected: {
    color: colors.error,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 0,
  },
  infoCard: {
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  deleteText: {
    color: colors.error,
  },
});
