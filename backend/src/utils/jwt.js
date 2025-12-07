import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * Generate a JWT token for a user
 * @param {object} payload - Data to encode in the token
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}
