import { Router } from 'express';
import * as authService from '../services/authService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login a user
 */
router.post('/login', async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
