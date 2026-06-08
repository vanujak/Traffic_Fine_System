const prisma = require("../config/db");
const env = require("../config/env");
const logger = require("../config/logger");

let twilioClient = null;

if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
  try {
    const twilio = require("twilio");
    twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    logger.info("Twilio SMS service initialized");
  } catch (error) {
    logger.warn(`Twilio not initialized: ${error.message}`);
  }
} else {
  logger.warn(
    "SMS service: Twilio credentials not set - SMS will be logged only",
  );
}

const sendSMS = async (to, message) => {
  if (!twilioClient) {
    logger.info(`[SMS MOCK] To: ${to} | Message: ${message}`);
    return { sid: null };
  }

  const result = await twilioClient.messages.create({
    body: message,
    from: env.TWILIO_PHONE_NUMBER,
    to,
  });

  return { sid: result.sid };
};

const sendPaymentConfirmationSms = async (
  officerPhone,
  driverName,
  referenceNumber,
  amount,
  paymentId,
) => {
  const message =
    `[Traffic Fine System] Payment received for fine ${referenceNumber}. ` +
    `Driver: ${driverName}. Amount: LKR ${Number(amount).toFixed(2)}.`;

  let status = "SUCCESS";
  let sid = null;

  try {
    const smsResult = await sendSMS(officerPhone, message);
    sid = smsResult.sid || null;
  } catch (error) {
    status = "FAILED";
    logger.error("Failed to send payment confirmation SMS", {
      error: error.message,
      officerPhone,
      referenceNumber,
    });
  }

  if (paymentId) {
    try {
      await prisma.sMSLog.create({
        data: {
          paymentId,
          officerPhone,
          message,
          status,
          sid,
        },
      });
    } catch (dbError) {
      logger.error("Failed to persist SMS log", {
        error: dbError.message,
        paymentId,
        officerPhone,
      });
    }
  }

  return { status, sid, message };
};

module.exports = { sendPaymentConfirmationSms };
