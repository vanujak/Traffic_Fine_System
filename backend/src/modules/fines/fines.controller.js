const prisma = require('../../config/db');
const logger = require('../../config/logger');

/**
 * Generate a unique reference number
 * Format: TF-YYYYMMDD-XXXXX
 */
const generateReferenceNo = () => {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).toUpperCase().slice(2, 7);
  return `TF-${datePart}-${randomPart}`;
};

/**
 * Create a new traffic fine
 * POST /api/v1/fines
 * Role: OFFICER
 */
const createFine = async (req, res, next) => {
  try {
    const { vehicleNo, driverName, driverPhone, driverNIC, offenseDate, location, categoryId, notes } = req.body;

    // Get officer profile for the logged-in user
    const officer = await prisma.officer.findUnique({ where: { userId: req.user.id } });
    if (!officer) {
      return res.status(403).json({ success: false, message: 'Officer profile not found.' });
    }

    const referenceNo = generateReferenceNo();

    const fine = await prisma.fine.create({
      data: {
        referenceNo,
        vehicleNo: vehicleNo.toUpperCase(),
        driverName,
        driverPhone: driverPhone || null,
        driverNIC: driverNIC || null,
        offenseDate: new Date(offenseDate),
        location,
        categoryId: parseInt(categoryId),
        officerId: officer.id,
        notes: notes || null,
      },
      include: {
        category: true,
        officer: {
          include: { user: { select: { name: true, email: true } }, district: true },
        },
      },
    });

    logger.info(`Fine created: ${referenceNo} by Officer ID ${officer.id}`);

    return res.status(201).json({
      success: true,
      message: 'Traffic fine created successfully.',
      data: fine,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Look up a fine by reference number (PUBLIC - used by mobile app / web portal)
 * GET /api/v1/fines/:referenceNo
 */
const getFineByReference = async (req, res, next) => {
  try {
    const { referenceNo } = req.params;

    const fine = await prisma.fine.findUnique({
      where: { referenceNo },
      include: {
        category: true,
        officer: {
          include: {
            user: { select: { name: true } },
            district: true,
          },
        },
        payment: true,
      },
    });

    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine not found.' });
    }

    return res.status(200).json({ success: true, data: fine });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all fines (Admin only)
 * GET /api/v1/fines?page=1&limit=10&status=PENDING&districtId=1
 */
const getAllFines = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, districtId, vehicleNo, officerId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (vehicleNo) where.vehicleNo = { contains: vehicleNo.toUpperCase() };
    if (officerId) where.officerId = parseInt(officerId);
    if (districtId) {
      where.officer = { districtId: parseInt(districtId) };
    }

    const [fines, total] = await Promise.all([
      prisma.fine.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          officer: { include: { user: { select: { name: true } }, district: true } },
          payment: true,
        },
      }),
      prisma.fine.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: fines,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get fines issued by the logged-in officer
 * GET /api/v1/fines/my-fines
 */
const getMyFines = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const officer = await prisma.officer.findUnique({ where: { userId: req.user.id } });
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Officer profile not found.' });
    }

    const [fines, total] = await Promise.all([
      prisma.fine.findMany({
        where: { officerId: officer.id },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { category: true, payment: true },
      }),
      prisma.fine.count({ where: { officerId: officer.id } }),
    ]);

    return res.status(200).json({
      success: true,
      data: fines,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel a fine (Admin only)
 * PATCH /api/v1/fines/:id/cancel
 */
const cancelFine = async (req, res, next) => {
  try {
    const { id } = req.params;

    const fine = await prisma.fine.findUnique({ where: { id: parseInt(id) } });
    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine not found.' });
    }
    if (fine.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a paid fine.' });
    }

    const updated = await prisma.fine.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' },
    });

    return res.status(200).json({ success: true, message: 'Fine cancelled.', data: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all fine categories (Public)
 * GET /api/v1/fines/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.fineCategory.findMany({ orderBy: { name: 'asc' } });
    return res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

module.exports = { createFine, getFineByReference, getAllFines, getMyFines, cancelFine, getCategories };
