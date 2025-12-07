import { Router } from 'express';
import * as taskService from '../services/taskService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/projects/:projectId/tasks
 * Get all tasks for a project
 */
router.get('/projects/:projectId/tasks', async (req, res, next) => {
  try {
    const tasks = await taskService.getTasks(req.params.projectId, req.user.userId);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/projects/:projectId/tasks
 * Create a new task in a project
 */
router.post('/projects/:projectId/tasks', async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.params.projectId, req.body, req.user.userId);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tasks/:id
 * Get a single task by ID
 */
router.get('/tasks/:id', async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user.userId);
    res.json(task);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/tasks/:id
 * Update a task
 */
router.put('/tasks/:id', async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user.userId);
    res.json(task);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/tasks/:id/toggle
 * Toggle task status (TODO -> IN_PROGRESS -> DONE -> TODO)
 */
router.patch('/tasks/:id/toggle', async (req, res, next) => {
  try {
    const task = await taskService.toggleTaskStatus(req.params.id, req.user.userId);
    res.json(task);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/tasks/:id', async (req, res, next) => {
  try {
    const result = await taskService.deleteTask(req.params.id, req.user.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
