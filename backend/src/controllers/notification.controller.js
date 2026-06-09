const prisma = require("../config/db");
const { sendPaymentConfirmationSms } = require("../services/sms.service");

const listSmsLogs = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      100,
    );
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.sMSLog.findMany({
        skip,
        take: limit,
        orderBy: { sentAt: "desc" },
        include: {
          payment: {
            include: {
              fine: {
                include: {
                  category: true,
                  officer: { include: { district: true } },
                },
              },
            },
          },
        },
      }),
      prisma.sMSLog.count(),
    ]);

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getSmsLogByPaymentId = async (req, res, next) => {
  try {
    const logs = await prisma.sMSLog.findMany({
      where: { paymentId: Number(req.params.paymentId) },
      orderBy: { sentAt: "desc" },
      take: 1,
      include: {
        payment: {
          include: {
            fine: {
              include: {
                category: true,
                officer: { include: { district: true } },
              },
            },
          },
        },
      },
    });

    if (!logs.length) {
      return res
        .status(404)
        .json({ success: false, message: "SMS log not found." });
    }

    return res.status(200).json({ success: true, data: logs[0] });
  } catch (error) {
    next(error);
  }
};

const resendSms = async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: Number(req.params.paymentId) },
      include: {
        fine: {
          include: {
            officer: { include: { user: true } },
          },
        },
      },
    });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found." });
    }

    const officerPhone =
      payment.fine?.officer?.phone || payment.fine?.officer?.user?.phone;
    if (!officerPhone) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Officer phone number not available.",
        });
    }

    await sendPaymentConfirmationSms(
      officerPhone,
      payment.fine.driverName,
      payment.fine.referenceNo,
      payment.amount,
      payment.id,
    );

    const latestLog = await prisma.sMSLog.findFirst({
      where: { paymentId: payment.id },
      orderBy: { sentAt: "desc" },
    });

    return res.status(200).json({ success: true, data: latestLog });
  } catch (error) {
    next(error);
  }
};

module.exports = { listSmsLogs, getSmsLogByPaymentId, resendSms };
