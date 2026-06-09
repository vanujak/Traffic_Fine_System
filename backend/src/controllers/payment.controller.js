const prisma = require("../config/db");
const { sendPaymentConfirmationSms } = require("../services/sms.service");

const generateReceiptNo = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `REC-${ts}-${rand}`;
};

const payFine = async (req, res, next) => {
  try {
    const {
      referenceNo,
      payerName,
      payerPhone,
      paymentMethod = "ONLINE",
      transactionId = null,
    } = req.body;

    const fine = await prisma.fine.findUnique({
      where: { referenceNo },
      include: {
        category: true,
        officer: { include: { user: true, district: true } },
      },
    });

    if (!fine) {
      return res
        .status(404)
        .json({ success: false, message: "Fine not found." });
    }

    if (fine.status === "PAID") {
      return res
        .status(400)
        .json({ success: false, message: "This fine has already been paid." });
    }

    if (fine.status === "CANCELLED") {
      return res
        .status(400)
        .json({ success: false, message: "This fine has been cancelled." });
    }

    const receiptNo = generateReceiptNo();

    const [payment] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          fineId: fine.id,
          amount: fine.category.amount,
          payerName,
          payerPhone,
          paymentMethod,
          transactionId,
          receiptNo,
          status: "SUCCESS",
        },
      }),
      prisma.fine.update({ where: { id: fine.id }, data: { status: "PAID" } }),
    ]);

    const fullPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: {
        fine: {
          include: {
            category: true,
            officer: {
              include: {
                district: true,
                user: { select: { name: true, phone: true } },
              },
            },
          },
        },
      },
    });

    const officerPhone =
      fine.officer?.phone || fine.officer?.user?.phone || null;
    if (officerPhone) {
      setImmediate(() => {
        sendPaymentConfirmationSms(
          officerPhone,
          fine.driverName,
          fine.referenceNo,
          payment.amount,
          payment.id,
        ).catch(() => {});
      });
    }

    return res.status(201).json({ success: true, data: fullPayment });
  } catch (error) {
    next(error);
  }
};

const getPaymentById = async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        fine: {
          include: {
            category: true,
            officer: {
              include: {
                district: true,
                user: { select: { name: true, phone: true } },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found." });
    }

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

const getPaymentByReceiptNo = async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { receiptNo: req.params.receiptNo },
      include: {
        fine: {
          include: {
            category: true,
            officer: {
              include: {
                district: true,
                user: { select: { name: true, phone: true } },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Receipt not found." });
    }

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

const getPaymentStatusByReferenceNo = async (req, res, next) => {
  try {
    const fine = await prisma.fine.findUnique({
      where: { referenceNo: req.params.referenceNo },
      include: { payment: true },
    });

    if (!fine) {
      return res
        .status(404)
        .json({ success: false, message: "Fine not found." });
    }

    return res.status(200).json({
      success: true,
      data: {
        referenceNo: fine.referenceNo,
        status: fine.status,
        paid: fine.status === "PAID",
        payment: fine.payment || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

const listPayments = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      100,
    );
    const skip = (page - 1) * limit;
    const { status, districtId, from, to } = req.query;

    const where = {};
    if (status) where.status = status;
    if (from || to) {
      where.paidAt = {};
      if (from) where.paidAt.gte = new Date(from);
      if (to) where.paidAt.lte = new Date(`${to}T23:59:59.999Z`);
    }
    if (districtId) {
      where.fine = { officer: { districtId: Number(districtId) } };
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paidAt: "desc" },
        include: {
          fine: {
            include: {
              category: true,
              officer: {
                include: {
                  district: true,
                  user: { select: { name: true, phone: true } },
                },
              },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: payments,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  payFine,
  getPaymentById,
  getPaymentByReceiptNo,
  getPaymentStatusByReferenceNo,
  listPayments,
};
