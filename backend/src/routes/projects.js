import { Router } from 'express';
import * as projectService from '../services/projectService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/projects
 * Get all projects for the authenticated user
 */
router.get('/', async (req, res, next) => {
  try {
    const projects = await projectService.getProjects(req.user.userId);
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/projects/stats
 * Get project statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await projectService.getProjectStats(req.user.userId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/projects/:id
 * Get a single project by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user.userId);
    res.json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user.userId);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/projects/:id
 * Update a project
 */
router.put('/:id', async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.user.userId);
    res.json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
