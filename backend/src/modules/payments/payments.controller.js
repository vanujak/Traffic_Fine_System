const prisma = require('../../config/db');
const logger = require('../../config/logger');
const { sendPaymentSMS } = require('../notifications/sms.service');

/**
 * Generate unique receipt number
 */
const generateReceiptNo = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `REC-${ts}-${rand}`;
};

/**
 * Pay a fine
 * POST /api/v1/payments
 * Body: { referenceNo, payerName, payerPhone, paymentMethod }
 * Access: Public
 */
const payFine = async (req, res, next) => {
  try {
    const { referenceNo, payerName, payerPhone, paymentMethod = 'ONLINE' } = req.body;

    // Find fine
    const fine = await prisma.fine.findUnique({
      where: { referenceNo },
      include: { category: true, officer: { include: { user: true } } },
    });

    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine not found.' });
    }

    if (fine.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'This fine has already been paid.' });
    }

    if (fine.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'This fine has been cancelled.' });
    }

    const receiptNo = generateReceiptNo();

    // Create payment and update fine atomically
    const [payment] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          fineId: fine.id,
          amount: fine.category.amount,
          payerName,
          payerPhone,
          paymentMethod,
          receiptNo,
        },
      }),
      prisma.fine.update({
        where: { id: fine.id },
        data: { status: 'PAID' },
      }),
    ]);

    logger.info(`Payment received: ${receiptNo} for Fine ${referenceNo}`);

    // Send SMS notification asynchronously (non-blocking)
    setImmediate(async () => {
      try {
        if (fine.officer?.phone) {
          await sendPaymentSMS(payment, fine);
        }
      } catch (smsErr) {
        logger.error('SMS notification failed', { error: smsErr.message });
      }
    });

    // Fetch full payment details
    const fullPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: { fine: { include: { category: true, officer: { include: { user: { select: { name: true } }, district: true } } } } },
    });

    return res.status(201).json({
      success: true,
      message: 'Payment successful.',
      data: fullPayment,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get payment receipt by payment ID
 * GET /api/v1/payments/:id
 * Access: Public
 */
const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: {
        fine: {
          include: {
            category: true,
            officer: { include: { user: { select: { name: true } }, district: true } },
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    return res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

/**
 * Get payment receipt by receipt number
 * GET /api/v1/payments/receipt/:receiptNo
 * Access: Public
 */
const getPaymentByReceiptNo = async (req, res, next) => {
  try {
    const { receiptNo } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { receiptNo },
      include: {
        fine: {
          include: {
            category: true,
            officer: { include: { user: { select: { name: true } }, district: true } },
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Receipt not found.' });
    }

    return res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all payments (Admin only)
 * GET /api/v1/payments?page=1&limit=10
 */
const getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { paidAt: 'desc' },
        include: {
          fine: { include: { category: true, officer: { include: { district: true } } } },
        },
      }),
      prisma.payment.count(),
    ]);

    return res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { payFine, getPaymentById, getPaymentByReceiptNo, getAllPayments };
