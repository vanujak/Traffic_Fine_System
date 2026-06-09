const express = require("express");
const { body, param, query } = require("express-validator");
const {
  createFine,
  getFineByReference,
  verifyFine,
  getAllFines,
  getMyFines,
  cancelFine,
} = require("../controllers/fine.controller");
const { verifyToken, requireRole } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.get(
  "/officer/my-fines",
  verifyToken,
  requireRole("OFFICER"),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getMyFines,
);

router.get(
  "/",
  verifyToken,
  requireRole("ADMIN"),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getAllFines,
);

router.get(
  "/:referenceNo/verify",
  [
    param("referenceNo").notEmpty().withMessage("referenceNo is required"),
    body("fineCategoryId")
      .isInt({ min: 1 })
      .withMessage("fineCategoryId is required"),
  ],
  validate,
  verifyFine,
);

router.get(
  "/:referenceNo",
  [param("referenceNo").notEmpty().withMessage("referenceNo is required")],
  validate,
  getFineByReference,
);

router.post(
  "/",
  verifyToken,
  requireRole("OFFICER"),
  [
    body("vehicleNo")
      .trim()
      .notEmpty()
      .withMessage("Vehicle number is required"),
    body("driverName").trim().notEmpty().withMessage("Driver name is required"),
    body("driverPhone")
      .optional()
      .isString()
      .withMessage("Driver phone must be a string"),
    body("driverNIC")
      .optional()
      .isString()
      .withMessage("Driver NIC must be a string"),
    body("offenseDate")
      .isISO8601()
      .withMessage("Valid offense date is required"),
    body("location").trim().notEmpty().withMessage("Location is required"),
    body("categoryId")
      .isInt({ min: 1 })
      .withMessage("Valid category ID is required"),
    body("notes").optional().isString().withMessage("Notes must be a string"),
  ],
  validate,
  createFine,
);

router.put(
  "/:id/cancel",
  verifyToken,
  requireRole("ADMIN"),
  [param("id").isInt({ min: 1 }).withMessage("id must be a positive integer")],
  validate,
  cancelFine,
);

module.exports = router;
