// ===================================
// Unbond - Plan Screen
// ===================================

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';

import { colors, spacing, typography, borderRadius, shadows } from '../../utils/theme';
import { Card, ScreenWrapper, Button } from '../../components';
import { usePlanStore } from '../../store';
import type { PlanTask } from '../../types';

export function PlanScreen() {
  const {
    steps,
    tasks,
    loadPlan,
    toggleTask,
    getTasksForStep,
    getStepProgress,
    getOverallProgress,
  } = usePlanStore();

  const [expandedStep, setExpandedStep] = useState<string | null>('step-1');

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const overallProgress = getOverallProgress();

  const toggleStepExpansion = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const renderTask = (task: PlanTask) => (
    <Pressable
      key={task.id}
      style={styles.taskItem}
      onPress={() => toggleTask(task.id)}
    >
      <View
        style={[styles.checkbox, task.isCompleted && styles.checkboxChecked]}
      >
        {task.isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text
        style={[styles.taskText, task.isCompleted && styles.taskTextCompleted]}
      >
        {task.title}
      </Text>
    </Pressable>
  );

  return (
    <ScreenWrapper>
      {/* Overall Progress */}
      <Card style={styles.progressCard}>
        <Text style={styles.progressTitle}>Your Recovery Journey</Text>
        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBar, { width: `${overallProgress}%` }]}
          />
        </View>
        <Text style={styles.progressText}>{overallProgress}% Complete</Text>
        <Text style={styles.progressSubtext}>
          {overallProgress < 25
            ? 'Every step forward matters. You\'re doing great.'
            : overallProgress < 50
            ? 'You\'re making real progress. Keep going!'
            : overallProgress < 75
            ? 'You\'ve come so far. The hard work is paying off.'
            : overallProgress < 100
            ? 'Almost there! Your dedication is inspiring.'
            : 'Amazing! You\'ve completed your recovery plan.'}
        </Text>
      </Card>

      {/* Info card */}
      <Card style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          This plan is a guide, not a rigid timeline. Move at your own pace.
          Some steps may need revisiting. That's completely normal.
        </Text>
      </Card>

      {/* Steps */}
      {steps.map((step, index) => {
        const stepTasks = getTasksForStep(step.id);
        const stepProgress = getStepProgress(step.id);
        const isExpanded = expandedStep === step.id;
        const isCompleted = stepProgress === 100;

        return (
          <Card key={step.id} style={styles.stepCard}>
            <Pressable
              style={styles.stepHeader}
              onPress={() => toggleStepExpansion(step.id)}
            >
              <View style={styles.stepNumberContainer}>
                <View
                  style={[
                    styles.stepNumber,
                    isCompleted && styles.stepNumberCompleted,
                  ]}
                >
                  {isCompleted ? (
                    <Text style={styles.stepCheckmark}>✓</Text>
                  ) : (
                    <Text style={styles.stepNumberText}>{step.order}</Text>
                  )}
                </View>
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      isCompleted && styles.stepLineCompleted,
                    ]}
                  />
                )}
              </View>

              <View style={styles.stepContent}>
                <View style={styles.stepTitleRow}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.expandIcon}>
                    {isExpanded ? '▼' : '▶'}
                  </Text>
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>

                {/* Mini progress bar */}
                <View style={styles.stepProgressContainer}>
                  <View style={styles.stepProgressBarBg}>
                    <View
                      style={[
                        styles.stepProgressBar,
                        { width: `${stepProgress}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.stepProgressText}>{stepProgress}%</Text>
                </View>
              </View>
            </Pressable>

            {/* Tasks */}
            {isExpanded && (
              <View style={styles.tasksContainer}>
                {stepTasks.map(renderTask)}
              </View>
            )}
          </Card>
        );
      })}

      {/* Encouragement */}
      <View style={styles.encouragementCard}>
        <Text style={styles.encouragementEmoji}>🌱</Text>
        <Text style={styles.encouragementText}>
          Healing is not linear. Be patient and compassionate with yourself.
          Every small step is a victory.
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    backgroundColor: colors.primaryFaded,
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.heading3,
    color: colors.primaryDark,
    marginBottom: spacing.md,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.heading3,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  progressSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.warningLight,
    marginBottom: spacing.lg,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  infoText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  stepCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  stepHeader: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  stepNumberContainer: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  stepNumberCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepNumberText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  stepCheckmark: {
    color: colors.textOnPrimary,
    fontWeight: 'bold',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
  },
  stepLineCompleted: {
    backgroundColor: colors.success,
  },
  stepContent: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    flex: 1,
  },
  expandIcon: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  stepDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  stepProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  stepProgressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  stepProgressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  stepProgressText: {
    ...typography.small,
    color: colors.textSecondary,
    width: 35,
    textAlign: 'right',
  },
  tasksContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.textOnPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  taskText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  taskTextCompleted: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  encouragementCard: {
    backgroundColor: colors.accentLight,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  encouragementEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  encouragementText: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
