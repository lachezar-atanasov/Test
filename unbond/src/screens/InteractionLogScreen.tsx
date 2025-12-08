import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { InteractionLogEntry, InteractionType, RedFlag } from '../types';
import { theme } from '../utils/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const INTERACTION_TYPES: InteractionType[] = ['call', 'text', 'in-person', 'social-media', 'other'];
const RED_FLAGS: RedFlag[] = [
  'gaslighting',
  'blame-shifting',
  'silent-treatment',
  'love-bombing',
  'threats',
  'guilt-tripping',
  'isolation',
  'financial-control',
  'emotional-blackmail',
  'other',
];

export const InteractionLogScreen: React.FC = () => {
  const navigation = useNavigation();
  const { interactionLogs, addInteractionLog } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<InteractionType>('text');
  const [initiatedBy, setInitiatedBy] = useState<'me' | 'them'>('them');
  const [feelingBefore, setFeelingBefore] = useState(5);
  const [feelingDuring, setFeelingDuring] = useState(5);
  const [feelingAfter, setFeelingAfter] = useState(5);
  const [redFlags, setRedFlags] = useState<RedFlag[]>([]);
  const [notes, setNotes] = useState('');

  const toggleRedFlag = (flag: RedFlag) => {
    setRedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const handleSubmit = async () => {
    const entry: InteractionLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      initiatedBy,
      feelingBefore,
      feelingDuring,
      feelingAfter,
      redFlags,
      notes: notes.trim() || undefined,
    };
    await addInteractionLog(entry);
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setType('text');
    setInitiatedBy('them');
    setFeelingBefore(5);
    setFeelingDuring(5);
    setFeelingAfter(5);
    setRedFlags([]);
    setNotes('');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const sortedLogs = [...interactionLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (showForm) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.formTitle}>Log an Interaction</Text>
          <Text style={styles.formSubtitle}>
            Tracking interactions helps you see patterns and validate your experiences.
          </Text>

          <View style={styles.section}>
            <Text style={styles.label}>Type of Interaction</Text>
            <View style={styles.optionsRow}>
              {INTERACTION_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.optionButton, type === t && styles.optionButtonSelected]}
                  onPress={() => setType(t)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      type === t && styles.optionTextSelected,
                    ]}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Who Initiated</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  initiatedBy === 'me' && styles.optionButtonSelected,
                ]}
                onPress={() => setInitiatedBy('me')}
              >
                <Text
                  style={[
                    styles.optionText,
                    initiatedBy === 'me' && styles.optionTextSelected,
                  ]}
                >
                  Me
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  initiatedBy === 'them' && styles.optionButtonSelected,
                ]}
                onPress={() => setInitiatedBy('them')}
              >
                <Text
                  style={[
                    styles.optionText,
                    initiatedBy === 'them' && styles.optionTextSelected,
                  ]}
                >
                  Them
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>How I Felt Before (1-10)</Text>
            <View style={styles.scaleContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.scaleButton,
                    feelingBefore === num && styles.scaleButtonSelected,
                  ]}
                  onPress={() => setFeelingBefore(num)}
                >
                  <Text
                    style={[
                      styles.scaleText,
                      feelingBefore === num && styles.scaleTextSelected,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>How I Felt During (1-10)</Text>
            <View style={styles.scaleContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.scaleButton,
                    feelingDuring === num && styles.scaleButtonSelected,
                  ]}
                  onPress={() => setFeelingDuring(num)}
                >
                  <Text
                    style={[
                      styles.scaleText,
                      feelingDuring === num && styles.scaleTextSelected,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>How I Felt After (1-10)</Text>
            <View style={styles.scaleContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.scaleButton,
                    feelingAfter === num && styles.scaleButtonSelected,
                  ]}
                  onPress={() => setFeelingAfter(num)}
                >
                  <Text
                    style={[
                      styles.scaleText,
                      feelingAfter === num && styles.scaleTextSelected,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Red Flags Observed</Text>
            <View style={styles.redFlagsGrid}>
              {RED_FLAGS.map((flag) => (
                <TouchableOpacity
                  key={flag}
                  style={[
                    styles.redFlagButton,
                    redFlags.includes(flag) && styles.redFlagButtonSelected,
                  ]}
                  onPress={() => toggleRedFlag(flag)}
                >
                  <Text
                    style={[
                      styles.redFlagText,
                      redFlags.includes(flag) && styles.redFlagTextSelected,
                    ]}
                  >
                    {flag.charAt(0).toUpperCase() + flag.slice(1).replace('-', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={styles.noteInput}
              multiline
              value={notes}
              onChangeText={setNotes}
              placeholder="What happened? How did you respond?"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              onPress={() => setShowForm(false)}
              variant="outline"
              style={styles.button}
            />
            <Button title="Save" onPress={handleSubmit} style={styles.button} />
          </View>
        </Card>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="+ Log Interaction"
          onPress={() => setShowForm(true)}
          style={styles.addButton}
        />
      </View>

      <FlatList
        data={sortedLogs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              // @ts-ignore - navigation type
              (navigation as any).navigate('InteractionDetail', { entryId: item.id });
            }}
          >
            <Card>
              <View style={styles.logItem}>
                <View style={styles.logHeader}>
                  <Text style={styles.logDate}>{formatDate(item.timestamp)}</Text>
                  <Text style={styles.logType}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1).replace('-', ' ')}
                  </Text>
                </View>
                <Text style={styles.logInitiated}>
                  Initiated by: {item.initiatedBy === 'me' ? 'Me' : 'Them'}
                </Text>
                <Text style={styles.logFeelings}>
                  Feelings: {item.feelingBefore} → {item.feelingDuring} → {item.feelingAfter}
                </Text>
                {item.redFlags.length > 0 && (
                  <View style={styles.redFlagsList}>
                    {item.redFlags.slice(0, 3).map((flag) => (
                      <View key={flag} style={styles.redFlagTag}>
                        <Text style={styles.redFlagTagText}>
                          {flag.charAt(0).toUpperCase() + flag.slice(1).replace('-', ' ')}
                        </Text>
                      </View>
                    ))}
                    {item.redFlags.length > 3 && (
                      <Text style={styles.moreFlags}>+{item.redFlags.length - 3} more</Text>
                    )}
                  </View>
                )}
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Card>
            <Text style={styles.emptyText}>
              No interactions logged yet. Start tracking to identify patterns.
            </Text>
          </Card>
        }
      />
    </View>
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
    padding: theme.spacing.md,
  },
  addButton: {
    width: '100%',
  },
  formTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  formSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  optionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  optionButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
  optionTextSelected: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
  scaleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  scaleButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  scaleText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  scaleTextSelected: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
  redFlagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  redFlagButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.surface,
  },
  redFlagButtonSelected: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.error,
  },
  redFlagText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
  },
  redFlagTextSelected: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minHeight: 100,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    ...theme.typography.body,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  button: {
    flex: 1,
  },
  list: {
    padding: theme.spacing.md,
  },
  logItem: {
    padding: theme.spacing.sm,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  logDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  logType: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  logInitiated: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  logFeelings: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  redFlagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  redFlagTag: {
    backgroundColor: theme.colors.error + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  redFlagTagText: {
    ...theme.typography.caption,
    color: theme.colors.error,
  },
  moreFlags: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    alignSelf: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
});
