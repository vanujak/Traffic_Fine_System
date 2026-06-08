const express = require('express');
const { getSummary, getDistrictReport, getCategoryReport, getRevenueReport, getDistricts } = require('./reports.controller');
const { verifyToken, requireRole } = require('../../middleware/jwtVerify');

const router = express.Router();

// GET /api/v1/reports/districts  (Public — used for dropdowns)
router.get('/districts', getDistricts);

// All routes below are Admin only
router.use(verifyToken, requireRole('ADMIN'));

// GET /api/v1/reports/summary
router.get('/summary', getSummary);

// GET /api/v1/reports/district
router.get('/district', getDistrictReport);

// GET /api/v1/reports/category
router.get('/category', getCategoryReport);

// GET /api/v1/reports/revenue?year=2026
router.get('/revenue', getRevenueReport);

module.exports = router;
