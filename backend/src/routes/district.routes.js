const express = require("express");
const { body, param } = require("express-validator");
const {
  listDistricts,
  getDistrictById,
  createDistrict,
  updateDistrict,
} = require("../controllers/district.controller");
const { verifyToken, requireRole } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", listDistricts);

router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("id must be a positive integer")],
  validate,
  getDistrictById,
);

router.post(
  "/",
  verifyToken,
  requireRole("ADMIN"),
  [body("name").trim().notEmpty().withMessage("Name is required")],
  validate,
  createDistrict,
);

router.put(
  "/:id",
  verifyToken,
  requireRole("ADMIN"),
  [
    param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
    body("name").trim().notEmpty().withMessage("Name is required"),
  ],
  validate,
  updateDistrict,
);

module.exports = router;
