import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt.js';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Register a new user
 */
export async function register(data) {
  const validated = registerSchema.parse(data);
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validated.email }
  });

  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validated.password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: validated.email,
      password: hashedPassword,
      name: validated.name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    }
  });

  // Generate token
  const token = generateToken({ userId: user.id, email: user.email });

  return { user, token };
}

/**
 * Login a user
 */
export async function login(data) {
  const validated = loginSchema.parse(data);

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: validated.email }
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Verify password
  const validPassword = await bcrypt.compare(validated.password, user.password);

  if (!validPassword) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate token
  const token = generateToken({ userId: user.id, email: user.email });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    token
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    }
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
}
