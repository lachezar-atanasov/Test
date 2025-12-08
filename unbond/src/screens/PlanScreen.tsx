import React from 'react';
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

export const PlanScreen: React.FC = () => {
  const { planSteps, planTasks, toggleTask } = useAppStore();

  const getStepProgress = (stepId: string) => {
    const stepTasks = planTasks.filter((task) => task.stepId === stepId);
    if (stepTasks.length === 0) return 0;
    const completed = stepTasks.filter((task) => task.completed).length;
    return Math.round((completed / stepTasks.length) * 100);
  };

  const getOverallProgress = () => {
    if (planTasks.length === 0) return 0;
    const completed = planTasks.filter((task) => task.completed).length;
    return Math.round((completed / planTasks.length) * 100);
  };

  const sortedSteps = [...planSteps].sort((a, b) => a.order - b.order);
  const overallProgress = getOverallProgress();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.progressCard}>
        <Text style={styles.progressTitle}>Overall Progress</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${overallProgress}%` }]} />
        </View>
        <Text style={styles.progressText}>{overallProgress}% Complete</Text>
      </Card>

      {sortedSteps.map((step) => {
        const progress = getStepProgress(step.id);
        const stepTasks = planTasks.filter((task) => task.stepId === step.id);

        return (
          <Card key={step.id} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.order}</Text>
              </View>
              <View style={styles.stepHeaderContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>

            <Text style={styles.stepDescription}>{step.description}</Text>

            <View style={styles.tasksContainer}>
              {stepTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskItem}
                  onPress={() => toggleTask(task.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      task.completed && styles.checkboxChecked,
                    ]}
                  >
                    {task.completed && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text
                    style={[
                      styles.taskText,
                      task.completed && styles.taskTextCompleted,
                    ]}
                  >
                    {task.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        );
      })}
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
  progressCard: {
    backgroundColor: theme.colors.primary + '10',
    marginBottom: theme.spacing.lg,
  },
  progressTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  progressText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  stepCard: {
    marginBottom: theme.spacing.lg,
  },
  stepHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  stepNumberText: {
    ...theme.typography.h3,
    color: theme.colors.surface,
    fontWeight: 'bold',
  },
  stepHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
  },
  stepDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  tasksContainer: {
    marginTop: theme.spacing.sm,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  checkboxChecked: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success,
  },
  checkmark: {
    color: theme.colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
  taskText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
});
