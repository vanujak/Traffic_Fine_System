const prisma = require('../../config/db');
const env = require('../../config/env');
const logger = require('../../config/logger');

let twilioClient = null;

// Initialize Twilio only if credentials exist
if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    logger.info('Twilio SMS service initialized');
  } catch (err) {
    logger.warn('Twilio not initialized: ' + err.message);
  }
} else {
  logger.warn('SMS service: Twilio credentials not set — SMS will be logged only');
}

/**
 * Send an SMS using Twilio (or log it if Twilio not configured)
 */
const sendSMS = async (to, message) => {
  if (!twilioClient) {
    logger.info(`[SMS MOCK] To: ${to} | Message: ${message}`);
    return { status: 'MOCK', sid: null };
  }

  const result = await twilioClient.messages.create({
    body: message,
    from: env.TWILIO_PHONE_NUMBER,
    to,
  });

  logger.info(`SMS sent to ${to}: SID ${result.sid}`);
  return { status: 'SENT', sid: result.sid };
};

/**
 * Send payment notification SMS to the officer
 * Called after successful payment
 */
const sendPaymentSMS = async (payment, fine) => {
  const officerPhone = fine.officer?.phone;
  if (!officerPhone) return;

  const message =
    `[Traffic Fine System] Fine PAID\n` +
    `Reference: ${fine.referenceNo}\n` +
    `Vehicle: ${fine.vehicleNo}\n` +
    `Amount: LKR ${payment.amount.toFixed(2)}\n` +
    `Receipt: ${payment.receiptNo}\n` +
    `Paid by: ${payment.payerName}`;

  try {
    const result = await sendSMS(officerPhone, message);

    // Log SMS to database
    await prisma.sMSLog.create({
      data: {
        paymentId: payment.id,
        phone: officerPhone,
        message,
        status: result.status,
        sid: result.sid || null,
      },
    });
  } catch (err) {
    logger.error('Failed to send SMS', { error: err.message, phone: officerPhone });
    // Log failure to DB
    await prisma.sMSLog.create({
      data: {
        paymentId: payment.id,
        phone: officerPhone,
        message,
        status: 'FAILED',
        sid: null,
      },
    }).catch(() => {});
  }
};

module.exports = { sendSMS, sendPaymentSMS };
