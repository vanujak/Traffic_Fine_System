const express = require("express");
const {
  getSummary,
  getDistrictReport,
  getCategoryReport,
  getRevenueReport,
  getDistricts,
} = require("../modules/reports/reports.controller");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/districts", getDistricts);
router.get(
  "/summary",
  verifyToken,
  requireRole("ADMIN", "OFFICER"),
  getSummary,
);
router.get(
  "/district",
  verifyToken,
  requireRole("ADMIN", "OFFICER"),
  getDistrictReport,
);
router.get(
  "/category",
  verifyToken,
  requireRole("ADMIN", "OFFICER"),
  getCategoryReport,
);
router.get(
  "/revenue",
  verifyToken,
  requireRole("ADMIN", "OFFICER"),
  getRevenueReport,
);

module.exports = router;
