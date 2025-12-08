import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../utils/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { copingScripts } from '../data/copingScripts';
import { EmotionalLogEntry } from '../types';

const FEELINGS = [
  'I want to contact them',
  'I feel guilty',
  'I feel lonely',
  'I miss them',
  'I feel confused',
  'I feel anxious',
];

export const SosScreen: React.FC = () => {
  const { interactionLogs, emotionalLogs, addEmotionalLog } = useAppStore();
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [showGrounding, setShowGrounding] = useState(false);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);

  const negativeOutcomes = useMemo(() => {
    const recentInteractions = interactionLogs
      .filter((log) => {
        const daysAgo = (Date.now() - new Date(log.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo <= 30;
      })
      .filter((log) => log.feelingAfter <= 5)
      .slice(0, 3);

    return recentInteractions.map((log) => {
      const date = new Date(log.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      return {
        date,
        feeling: log.feelingAfter,
        redFlags: log.redFlags.length,
        notes: log.notes,
      };
    });
  }, [interactionLogs]);

  const handleDelayAction = async () => {
    const entry: EmotionalLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      intensity: selectedFeeling ? 7 : 5,
      emotion: 'longing',
      note: 'Delayed contacting - used SOS tools',
    };
    await addEmotionalLog(entry);
    setSelectedFeeling(null);
    setShowGrounding(false);
    setSelectedScript(null);
  };

  const groundingScripts = copingScripts.filter((s) => s.category === 'grounding');
  const affirmationScripts = copingScripts.filter((s) => s.category === 'affirmation');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.headerCard}>
        <Text style={styles.title}>I'm about to text/call them</Text>
        <Text style={styles.subtitle}>
          It's okay to feel this way. Let's pause and check in with yourself first.
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>What are you feeling right now?</Text>
        <View style={styles.feelingsGrid}>
          {FEELINGS.map((feeling) => (
            <TouchableOpacity
              key={feeling}
              style={[
                styles.feelingButton,
                selectedFeeling === feeling && styles.feelingButtonSelected,
              ]}
              onPress={() => setSelectedFeeling(feeling)}
            >
              <Text
                style={[
                  styles.feelingText,
                  selectedFeeling === feeling && styles.feelingTextSelected,
                ]}
              >
                {feeling}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {negativeOutcomes.length > 0 && (
        <Card style={styles.outcomesCard}>
          <Text style={styles.sectionTitle}>Remember Past Outcomes</Text>
          <Text style={styles.outcomesSubtitle}>
            Recent interactions that left you feeling worse:
          </Text>
          {negativeOutcomes.map((outcome, index) => (
            <View key={index} style={styles.outcomeItem}>
              <Text style={styles.outcomeDate}>{outcome.date}</Text>
              <Text style={styles.outcomeText}>
                Feeling after: {outcome.feeling}/10 • {outcome.redFlags} red flags
              </Text>
            </View>
          ))}
        </Card>
      )}

      <Card>
        <Text style={styles.sectionTitle}>Grounding Exercises</Text>
        <View style={styles.scriptsList}>
          {groundingScripts.map((script) => (
            <TouchableOpacity
              key={script.id}
              style={[
                styles.scriptButton,
                selectedScript === script.id && styles.scriptButtonSelected,
              ]}
              onPress={() => {
                setSelectedScript(script.id);
                setShowGrounding(true);
              }}
            >
              <Text
                style={[
                  styles.scriptTitle,
                  selectedScript === script.id && styles.scriptTitleSelected,
                ]}
              >
                {script.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {showGrounding && selectedScript && (
          <View style={styles.scriptContent}>
            {groundingScripts
              .find((s) => s.id === selectedScript)
              ?.content.split('\n')
              .map((line, index) => (
                <Text key={index} style={styles.scriptText}>
                  {line}
                </Text>
              ))}
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Affirmations</Text>
        <View style={styles.scriptsList}>
          {affirmationScripts.map((script) => (
            <View key={script.id} style={styles.affirmationCard}>
              <Text style={styles.affirmationTitle}>{script.title}</Text>
              <Text style={styles.affirmationText}>{script.content}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Button
        title="Delay contacting for now"
        onPress={handleDelayAction}
        variant="primary"
        style={styles.delayButton}
      />
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
  headerCard: {
    backgroundColor: theme.colors.accent + '20',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 22,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  feelingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  feelingButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  feelingButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  feelingText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
  feelingTextSelected: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
  outcomesCard: {
    backgroundColor: theme.colors.error + '10',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  outcomesSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  outcomeItem: {
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  outcomeDate: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  outcomeText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  scriptsList: {
    gap: theme.spacing.sm,
  },
  scriptButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
  },
  scriptButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  scriptTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  scriptTitleSelected: {
    color: theme.colors.primary,
  },
  scriptContent: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  scriptText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.xs,
  },
  affirmationCard: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  affirmationTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  affirmationText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  delayButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
});
