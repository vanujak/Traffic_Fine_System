const express = require("express");
const { body, param, query } = require("express-validator");
const {
  payFine,
  getPaymentById,
  getPaymentByReceiptNo,
  getPaymentStatusByReferenceNo,
  listPayments,
} = require("../controllers/payment.controller");
const { verifyToken, requireRole } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.get(
  "/",
  verifyToken,
  requireRole("ADMIN"),
  [
    query("status")
      .optional()
      .isString()
      .withMessage("status must be a string"),
    query("districtId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("districtId must be a positive integer"),
    query("from")
      .optional()
      .isISO8601()
      .withMessage("from must be a valid date"),
    query("to").optional().isISO8601().withMessage("to must be a valid date"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("limit must be between 1 and 100"),
  ],
  validate,
  listPayments,
);

router.get(
  "/fine/:referenceNo",
  [param("referenceNo").notEmpty().withMessage("referenceNo is required")],
  validate,
  getPaymentStatusByReferenceNo,
);

router.get(
  "/receipt/:receiptNo",
  [param("receiptNo").notEmpty().withMessage("receiptNo is required")],
  validate,
  getPaymentByReceiptNo,
);

router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("id must be a positive integer")],
  validate,
  getPaymentById,
);

router.post(
  "/",
  [
    body("referenceNo")
      .trim()
      .notEmpty()
      .withMessage("Reference number is required"),
    body("payerName").trim().notEmpty().withMessage("Payer name is required"),
    body("payerPhone").trim().notEmpty().withMessage("Payer phone is required"),
    body("paymentMethod")
      .optional()
      .isIn(["ONLINE", "ON_SPOT", "BANK"])
      .withMessage("Payment method must be ONLINE, ON_SPOT or BANK"),
    body("transactionId")
      .optional()
      .isString()
      .withMessage("transactionId must be a string"),
  ],
  validate,
  payFine,
);

module.exports = router;
