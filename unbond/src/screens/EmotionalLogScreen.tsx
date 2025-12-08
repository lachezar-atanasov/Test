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
import { EmotionalLogEntry, EmotionType } from '../types';
import { theme } from '../utils/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const EMOTIONS: EmotionType[] = [
  'fear',
  'guilt',
  'shame',
  'longing',
  'anger',
  'confusion',
  'relief',
  'anxiety',
  'sadness',
  'hope',
];

export const EmotionalLogScreen: React.FC = () => {
  const navigation = useNavigation();
  const { emotionalLogs, addEmotionalLog } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [intensity, setIntensity] = useState(5);
  const [emotion, setEmotion] = useState<EmotionType>('longing');
  const [note, setNote] = useState('');

  const handleSubmit = async () => {
    const entry: EmotionalLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      intensity,
      emotion,
      note: note.trim() || undefined,
    };
    await addEmotionalLog(entry);
    setShowForm(false);
    setIntensity(5);
    setEmotion('longing');
    setNote('');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const sortedLogs = [...emotionalLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (showForm) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.formTitle}>Log Your Craving</Text>
          <Text style={styles.formSubtitle}>
            It's okay to feel conflicted. Tracking helps you see patterns.
          </Text>

          <View style={styles.section}>
            <Text style={styles.label}>Intensity (1-10)</Text>
            <View style={styles.intensityContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.intensityButton,
                    intensity === num && styles.intensityButtonSelected,
                  ]}
                  onPress={() => setIntensity(num)}
                >
                  <Text
                    style={[
                      styles.intensityText,
                      intensity === num && styles.intensityTextSelected,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Main Emotion</Text>
            <View style={styles.emotionGrid}>
              {EMOTIONS.map((em) => (
                <TouchableOpacity
                  key={em}
                  style={[styles.emotionButton, emotion === em && styles.emotionButtonSelected]}
                  onPress={() => setEmotion(em)}
                >
                  <Text
                    style={[
                      styles.emotionText,
                      emotion === em && styles.emotionTextSelected,
                    ]}
                  >
                    {em.charAt(0).toUpperCase() + em.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              multiline
              value={note}
              onChangeText={setNote}
              placeholder="What's on your mind?"
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
          title="+ Log Craving"
          onPress={() => setShowForm(true)}
          style={styles.addButton}
        />
        <Button
          title="View Chart"
          onPress={() => {
            // @ts-ignore - navigation type
            (navigation as any).navigate('CravingDetail');
          }}
          variant="outline"
          style={styles.addButton}
        />
      </View>

      <FlatList
        data={sortedLogs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.logItem}>
              <View style={styles.logHeader}>
                <Text style={styles.logDate}>{formatDate(item.timestamp)}</Text>
                <Text style={styles.logIntensity}>Intensity: {item.intensity}/10</Text>
              </View>
              <Text style={styles.logEmotion}>
                {item.emotion.charAt(0).toUpperCase() + item.emotion.slice(1)}
              </Text>
              {item.note && <Text style={styles.logNote}>{item.note}</Text>}
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Card>
            <Text style={styles.emptyText}>
              No entries yet. Start tracking to see patterns over time.
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
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  addButton: {
    flex: 1,
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
  intensityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  intensityButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  intensityText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  intensityTextSelected: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  emotionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  emotionButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  emotionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
  emotionTextSelected: {
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
  logIntensity: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  logEmotion: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  logNote: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
});
