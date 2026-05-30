const prisma = require('../../config/db');

/**
 * Nationwide summary
 * GET /api/v1/reports/summary
 * Admin only
 */
const getSummary = async (req, res, next) => {
  try {
    const [totalFines, totalPaid, totalPending, totalCancelled, revenueResult] = await Promise.all([
      prisma.fine.count(),
      prisma.fine.count({ where: { status: 'PAID' } }),
      prisma.fine.count({ where: { status: 'PENDING' } }),
      prisma.fine.count({ where: { status: 'CANCELLED' } }),
      prisma.payment.aggregate({ _sum: { amount: true } }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalFines,
        totalPaid,
        totalPending,
        totalCancelled,
        totalRevenue: revenueResult._sum.amount || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * District-wise collections
 * GET /api/v1/reports/district
 * Admin only
 */
const getDistrictReport = async (req, res, next) => {
  try {
    const districts = await prisma.district.findMany({
      include: {
        officers: {
          include: {
            fines: {
              include: { payment: true },
            },
          },
        },
      },
    });

    const report = districts.map((district) => {
      let totalFines = 0;
      let paidFines = 0;
      let totalRevenue = 0;

      district.officers.forEach((officer) => {
        officer.fines.forEach((fine) => {
          totalFines++;
          if (fine.status === 'PAID' && fine.payment) {
            paidFines++;
            totalRevenue += fine.payment.amount;
          }
        });
      });

      return {
        district: district.name,
        districtId: district.id,
        totalFines,
        paidFines,
        pendingFines: totalFines - paidFines,
        totalRevenue,
      };
    });

    return res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

/**
 * Fine category analysis
 * GET /api/v1/reports/category
 * Admin only
 */
const getCategoryReport = async (req, res, next) => {
  try {
    const categories = await prisma.fineCategory.findMany({
      include: {
        fines: {
          include: { payment: true },
        },
      },
    });

    const report = categories.map((cat) => {
      const totalFines = cat.fines.length;
      const paidFines = cat.fines.filter((f) => f.status === 'PAID').length;
      const totalRevenue = cat.fines
        .filter((f) => f.payment)
        .reduce((sum, f) => sum + f.payment.amount, 0);

      return {
        category: cat.name,
        categoryId: cat.id,
        standardAmount: cat.amount,
        totalFines,
        paidFines,
        pendingFines: totalFines - paidFines,
        totalRevenue,
      };
    });

    return res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

/**
 * Revenue over time (monthly)
 * GET /api/v1/reports/revenue?year=2026
 * Admin only
 */
const getRevenueReport = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const payments = await prisma.payment.findMany({
      where: {
        paidAt: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
      select: { amount: true, paidAt: true },
    });

    // Group by month
    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(year, i, 1).toLocaleString('default', { month: 'long' }),
      totalRevenue: 0,
      totalPayments: 0,
    }));

    payments.forEach((p) => {
      const month = new Date(p.paidAt).getMonth();
      monthly[month].totalRevenue += p.amount;
      monthly[month].totalPayments += 1;
    });

    return res.status(200).json({ success: true, data: { year, monthly } });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all districts (for dropdowns)
 * GET /api/v1/reports/districts
 * Public
 */
const getDistricts = async (req, res, next) => {
  try {
    const districts = await prisma.district.findMany({ orderBy: { name: 'asc' } });
    return res.status(200).json({ success: true, data: districts });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getDistrictReport, getCategoryReport, getRevenueReport, getDistricts };
