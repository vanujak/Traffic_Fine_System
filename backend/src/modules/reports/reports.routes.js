const express = require("express");
const router = express.Router();
const reportsController = require("./reports.controller");
const { verifyToken, requireRole } = require("../../middleware/jwtVerify");

// Public: get list of districts
router.get("/districts", reportsController.getDistricts);

// Protected: summary and reports (ADMIN or OFFICER)
router.get(
  "/summary",
  verifyToken,
  requireRole("ADMIN", "OFFICER"),
  reportsController.getSummary,
);
router.get(
  "/district",
  verifyToken,
  requireRole("ADMIN", "OFFICER"),
  reportsController.getDistrictReport,
);
router.get(
  "/category",
  verifyToken,
  requireRole("ADMIN", "OFFICER"),
  reportsController.getCategoryReport,
);
router.get(
  "/revenue",
  verifyToken,
  requireRole("ADMIN", "OFFICER"),
  reportsController.getRevenueReport,
);

module.exports = router;
