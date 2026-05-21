const express = require('express');
const { body } = require('express-validator');
const {
  createFine,
  getFineByReference,
  getAllFines,
  getMyFines,
  cancelFine,
  getCategories,
} = require('./fines.controller');
const { verifyToken, requireRole } = require('../../middleware/jwtVerify');
const validate = require('../../middleware/validate');

const router = express.Router();

// GET /api/v1/fines/categories  (Public)
router.get('/categories', getCategories);

// GET /api/v1/fines/my-fines  (Officer only)
router.get('/my-fines', verifyToken, requireRole('OFFICER'), getMyFines);

// GET /api/v1/fines  (Admin only)
router.get('/', verifyToken, requireRole('ADMIN'), getAllFines);

// GET /api/v1/fines/:referenceNo  (Public)
router.get('/:referenceNo', getFineByReference);

// POST /api/v1/fines  (Officer only)
router.post(
  '/',
  verifyToken,
  requireRole('OFFICER'),
  [
    body('vehicleNo').trim().notEmpty().withMessage('Vehicle number is required'),
    body('driverName').trim().notEmpty().withMessage('Driver name is required'),
    body('offenseDate').isISO8601().withMessage('Valid offense date is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('categoryId').isInt({ min: 1 }).withMessage('Valid category ID is required'),
  ],
  validate,
  createFine
);

// PATCH /api/v1/fines/:id/cancel  (Admin only)
router.patch('/:id/cancel', verifyToken, requireRole('ADMIN'), cancelFine);

module.exports = router;
