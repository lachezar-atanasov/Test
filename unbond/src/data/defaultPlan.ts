import { PlanStep, PlanTask } from '../types';

export const defaultPlanSteps: PlanStep[] = [
  {
    id: 'step-1',
    title: 'Education Phase',
    description:
      'Understanding trauma bonds, manipulation patterns, and why leaving feels so difficult. This knowledge helps validate your experiences and provides a foundation for healing.',
    order: 1,
    tasks: [
      {
        id: 'task-1-1',
        stepId: 'step-1',
        title: 'Read articles about trauma bonds',
        completed: false,
      },
      {
        id: 'task-1-2',
        stepId: 'step-1',
        title: 'Identify manipulation patterns you\'ve experienced',
        completed: false,
      },
      {
        id: 'task-1-3',
        stepId: 'step-1',
        title: 'Understand your attachment and nervous system responses',
        completed: false,
      },
    ],
  },
  {
    id: 'step-2',
    title: 'Boundary Setting',
    description:
      'Learning to set and maintain boundaries is crucial for your safety and well-being. Start with small boundaries and build from there.',
    order: 2,
    tasks: [
      {
        id: 'task-2-1',
        stepId: 'step-2',
        title: 'Identify your non-negotiable boundaries',
        completed: false,
      },
      {
        id: 'task-2-2',
        stepId: 'step-2',
        title: 'Practice saying "no" in safe situations',
        completed: false,
      },
      {
        id: 'task-2-3',
        stepId: 'step-2',
        title: 'Create scripts for boundary communication',
        completed: false,
      },
    ],
  },
  {
    id: 'step-3',
    title: 'Preparing Environment & Support',
    description:
      'Building a safety net before making major changes. This includes practical preparations and emotional support systems.',
    order: 3,
    tasks: [
      {
        id: 'task-3-1',
        stepId: 'step-3',
        title: 'Identify trusted friends or family members',
        completed: false,
      },
      {
        id: 'task-3-2',
        stepId: 'step-3',
        title: 'Secure important documents and financial resources',
        completed: false,
      },
      {
        id: 'task-3-3',
        stepId: 'step-3',
        title: 'Create a safety plan if needed',
        completed: false,
      },
      {
        id: 'task-3-4',
        stepId: 'step-3',
        title: 'Research local support resources (therapists, support groups)',
        completed: false,
      },
    ],
  },
  {
    id: 'step-4',
    title: 'Executing Distance / No-Contact',
    description:
      'Taking steps to create physical and emotional distance. This might mean no-contact, low-contact, or structured boundaries depending on your situation.',
    order: 4,
    tasks: [
      {
        id: 'task-4-1',
        stepId: 'step-4',
        title: 'Decide on contact level (no-contact vs low-contact)',
        completed: false,
      },
      {
        id: 'task-4-2',
        stepId: 'step-4',
        title: 'Block or limit communication channels',
        completed: false,
      },
      {
        id: 'task-4-3',
        stepId: 'step-4',
        title: 'Use SOS tools when feeling the urge to contact',
        completed: false,
      },
      {
        id: 'task-4-4',
        stepId: 'step-4',
        title: 'Log interactions and cravings to track patterns',
        completed: false,
      },
    ],
  },
  {
    id: 'step-5',
    title: 'Stabilization Phase',
    description:
      'Focusing on emotional regulation, processing grief, and rebuilding your sense of self. This phase takes time and patience.',
    order: 5,
    tasks: [
      {
        id: 'task-5-1',
        stepId: 'step-5',
        title: 'Practice daily grounding exercises',
        completed: false,
      },
      {
        id: 'task-5-2',
        stepId: 'step-5',
        title: 'Allow yourself to grieve the relationship',
        completed: false,
      },
      {
        id: 'task-5-3',
        stepId: 'step-5',
        title: 'Reconnect with activities and interests you enjoy',
        completed: false,
      },
      {
        id: 'task-5-4',
        stepId: 'step-5',
        title: 'Work on rebuilding self-trust and self-compassion',
        completed: false,
      },
    ],
  },
  {
    id: 'step-6',
    title: 'Building New Life Pillars',
    description:
      'Creating a life that supports your well-being. This includes healthy relationships, meaningful activities, and ongoing self-care.',
    order: 6,
    tasks: [
      {
        id: 'task-6-1',
        stepId: 'step-6',
        title: 'Nurture healthy relationships with safe people',
        completed: false,
      },
      {
        id: 'task-6-2',
        stepId: 'step-6',
        title: 'Establish consistent self-care routines',
        completed: false,
      },
      {
        id: 'task-6-3',
        stepId: 'step-6',
        title: 'Set personal goals and work toward them',
        completed: false,
      },
      {
        id: 'task-6-4',
        stepId: 'step-6',
        title: 'Continue learning and growing',
        completed: false,
      },
    ],
  },
];

export const defaultPlanTasks: PlanTask[] = defaultPlanSteps.flatMap((step) => step.tasks);
