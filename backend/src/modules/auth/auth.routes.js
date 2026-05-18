const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, changePassword } = require('./auth.controller');
const { verifyToken, requireRole } = require('../../middleware/jwtVerify');
const { authLimiter } = require('../../middleware/rateLimiter');
const validate = require('../../middleware/validate');

const router = express.Router();

// POST /api/v1/auth/register  (Admin only — admins create officer/admin accounts)
router.post(
  '/register',
  verifyToken,
  requireRole('ADMIN'),
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role').isIn(['OFFICER', 'ADMIN']).withMessage('Role must be OFFICER or ADMIN'),
  ],
  validate,
  register
);

// POST /api/v1/auth/login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// GET /api/v1/auth/me  (Protected)
router.get('/me', verifyToken, getMe);

// PATCH /api/v1/auth/change-password  (Protected)
router.patch(
  '/change-password',
  verifyToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  validate,
  changePassword
);

module.exports = router;
