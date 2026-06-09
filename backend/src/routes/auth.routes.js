const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  refresh,
  logout,
  me,
} = require("../controllers/auth.controller");
const validate = require("../middleware/validate");
const { verifyToken } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post(
  "/register",
  verifyToken,
  authLimiter,
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
      .isLength({ min: 1 })
      .withMessage("badgeNo must not be empty"),
  ],
  validate,
  register,
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login,
);

router.post(
  "/refresh",
  [body("refreshToken").notEmpty().withMessage("refreshToken is required")],
  validate,
  refresh,
);

router.post("/logout", verifyToken, logout);

router.get("/me", verifyToken, me);

module.exports = router;
