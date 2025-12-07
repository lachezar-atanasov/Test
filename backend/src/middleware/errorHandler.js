import { ZodError } from 'zod';

/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflict',
      message: 'A record with this value already exists.'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Not found',
      message: 'The requested resource was not found.'
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal server error' : 'Error',
    message: statusCode === 500 ? 'An unexpected error occurred' : message
  });
}

/**
 * Not found handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
}
