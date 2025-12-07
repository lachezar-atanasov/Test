import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

/**
 * Get all tasks for a project
 */
export async function getTasks(projectId, userId) {
  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId }
  });

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.task.findMany({
    where: { projectId },
    orderBy: [
      { status: 'asc' },
      { priority: 'desc' },
      { createdAt: 'desc' }
    ]
  });
}

/**
 * Get a single task by ID
 */
export async function getTaskById(taskId, userId) {
  const task = await prisma.task.findFirst({
    where: { id: taskId },
    include: {
      project: {
        select: { userId: true, name: true }
      }
    }
  });

  if (!task || task.project.userId !== userId) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  return task;
}

/**
 * Create a new task
 */
export async function createTask(projectId, data, userId) {
  const validated = createTaskSchema.parse(data);

  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId }
  });

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.task.create({
    data: {
      ...validated,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      projectId
    }
  });
}

/**
 * Update a task
 */
export async function updateTask(taskId, data, userId) {
  const validated = updateTaskSchema.parse(data);

  // Verify ownership through project
  const task = await prisma.task.findFirst({
    where: { id: taskId },
    include: {
      project: {
        select: { userId: true }
      }
    }
  });

  if (!task || task.project.userId !== userId) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...validated,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : validated.dueDate === null ? null : undefined
    }
  });
}

/**
 * Delete a task
 */
export async function deleteTask(taskId, userId) {
  // Verify ownership through project
  const task = await prisma.task.findFirst({
    where: { id: taskId },
    include: {
      project: {
        select: { userId: true }
      }
    }
  });

  if (!task || task.project.userId !== userId) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  await prisma.task.delete({
    where: { id: taskId }
  });

  return { message: 'Task deleted successfully' };
}

/**
 * Toggle task status
 */
export async function toggleTaskStatus(taskId, userId) {
  const task = await getTaskById(taskId, userId);

  const statusOrder = ['TODO', 'IN_PROGRESS', 'DONE'];
  const currentIndex = statusOrder.indexOf(task.status);
  const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

  return prisma.task.update({
    where: { id: taskId },
    data: { status: nextStatus }
  });
}
