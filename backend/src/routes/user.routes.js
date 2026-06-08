const express = require("express");
const { body, param, query } = require("express-validator");
const {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");
const { verifyToken, requireRole } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(verifyToken, requireRole("ADMIN"));

router.get(
  "/",
  [
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
  listUsers,
);

router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("id must be a positive integer")],
  validate,
  getUserById,
);

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["OFFICER", "ADMIN"])
      .withMessage("Role must be OFFICER or ADMIN"),
    body("phone").optional().isString().withMessage("Phone must be a string"),
    body("districtId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("districtId must be a positive integer"),
    body("badgeNo")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("badgeNo must not be empty"),
  ],
  validate,
  createUser,
);

router.put(
  "/:id",
  [
    param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty"),
    body("phone").optional().isString().withMessage("Phone must be a string"),
    body("districtId")
      .optional({ nullable: true })
      .custom((value) => value === null || Number.isInteger(Number(value)))
      .withMessage("districtId must be an integer or null"),
    body("role")
      .optional()
      .isIn(["OFFICER", "ADMIN"])
      .withMessage("Role must be OFFICER or ADMIN"),
    body("badgeNo")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("badgeNo must not be empty"),
  ],
  validate,
  updateUser,
);

router.delete(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("id must be a positive integer")],
  validate,
  deleteUser,
);

module.exports = router;
