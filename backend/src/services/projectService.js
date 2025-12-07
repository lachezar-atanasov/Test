import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

/**
 * Get all projects for a user
 */
export async function getProjects(userId) {
  return prisma.project.findMany({
    where: { userId },
    include: {
      _count: {
        select: { tasks: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
}

/**
 * Get a single project by ID
 */
export async function getProjectById(projectId, userId) {
  const project = await prisma.project.findFirst({
    where: { 
      id: projectId,
      userId 
    },
    include: {
      tasks: {
        orderBy: [
          { status: 'asc' },
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      },
      _count: {
        select: { tasks: true }
      }
    }
  });

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  return project;
}

/**
 * Create a new project
 */
export async function createProject(data, userId) {
  const validated = createProjectSchema.parse(data);

  return prisma.project.create({
    data: {
      ...validated,
      userId
    },
    include: {
      _count: {
        select: { tasks: true }
      }
    }
  });
}

/**
 * Update a project
 */
export async function updateProject(projectId, data, userId) {
  const validated = updateProjectSchema.parse(data);

  // Verify ownership
  const existing = await prisma.project.findFirst({
    where: { id: projectId, userId }
  });

  if (!existing) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.project.update({
    where: { id: projectId },
    data: validated,
    include: {
      _count: {
        select: { tasks: true }
      }
    }
  });
}

/**
 * Delete a project
 */
export async function deleteProject(projectId, userId) {
  // Verify ownership
  const existing = await prisma.project.findFirst({
    where: { id: projectId, userId }
  });

  if (!existing) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  await prisma.project.delete({
    where: { id: projectId }
  });

  return { message: 'Project deleted successfully' };
}

/**
 * Get project statistics for a user
 */
export async function getProjectStats(userId) {
  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      tasks: {
        select: { status: true }
      }
    }
  });

  const stats = {
    totalProjects: projects.length,
    totalTasks: 0,
    tasksByStatus: {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0
    }
  };

  projects.forEach(project => {
    project.tasks.forEach(task => {
      stats.totalTasks++;
      stats.tasksByStatus[task.status]++;
    });
  });

  return stats;
}
