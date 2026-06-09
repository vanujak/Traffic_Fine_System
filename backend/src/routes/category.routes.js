const express = require("express");
const { body, param } = require("express-validator");
const {
  listActiveCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const { verifyToken, requireRole } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", listActiveCategories);

router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("id must be a positive integer")],
  validate,
  getCategoryById,
);

router.post(
  "/",
  verifyToken,
  requireRole("ADMIN"),
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
  ],
  validate,
  createCategory,
);

router.put(
  "/:id",
  verifyToken,
  requireRole("ADMIN"),
  [
    param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty"),
    body("amount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean"),
  ],
  validate,
  updateCategory,
);

router.delete(
  "/:id",
  verifyToken,
  requireRole("ADMIN"),
  [param("id").isInt({ min: 1 }).withMessage("id must be a positive integer")],
  validate,
  deleteCategory,
);

module.exports = router;
