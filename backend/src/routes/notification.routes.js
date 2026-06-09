const express = require("express");
const { param, query } = require("express-validator");
const {
  listSmsLogs,
  getSmsLogByPaymentId,
  resendSms,
} = require("../controllers/notification.controller");
const { verifyToken, requireRole } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.get(
  "/sms/logs",
  verifyToken,
  requireRole("ADMIN"),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  listSmsLogs,
);

router.get(
  "/sms/logs/:paymentId",
  verifyToken,
  requireRole("ADMIN"),
  [param("paymentId").isInt({ min: 1 })],
  validate,
  getSmsLogByPaymentId,
);

router.post(
  "/sms/resend/:paymentId",
  verifyToken,
  requireRole("ADMIN"),
  [param("paymentId").isInt({ min: 1 })],
  validate,
  resendSms,
);

module.exports = router;
