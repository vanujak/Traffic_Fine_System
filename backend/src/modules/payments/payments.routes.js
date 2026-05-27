const express = require('express');
const { body } = require('express-validator');
const { payFine, getPaymentById, getPaymentByReceiptNo, getAllPayments } = require('./payments.controller');
const { verifyToken, requireRole } = require('../../middleware/jwtVerify');
const validate = require('../../middleware/validate');

const router = express.Router();

// GET /api/v1/payments  (Admin only)
router.get('/', verifyToken, requireRole('ADMIN'), getAllPayments);

// GET /api/v1/payments/receipt/:receiptNo  (Public)
router.get('/receipt/:receiptNo', getPaymentByReceiptNo);

// GET /api/v1/payments/:id  (Public)
router.get('/:id', getPaymentById);

// POST /api/v1/payments  (Public)
router.post(
  '/',
  [
    body('referenceNo').trim().notEmpty().withMessage('Reference number is required'),
    body('payerName').trim().notEmpty().withMessage('Payer name is required'),
    body('payerPhone').trim().notEmpty().withMessage('Payer phone is required'),
    body('paymentMethod')
      .optional()
      .isIn(['ONLINE', 'ON_SPOT', 'BANK'])
      .withMessage('Payment method must be ONLINE, ON_SPOT or BANK'),
  ],
  validate,
  payFine
);

module.exports = router;
