/**
 * OTP Service
 * Sends OTP via Twilio SMS
 * Falls back gracefully in development
 */

const sendOTP = async (phone, code) => {
  // In production, use Twilio
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require("twilio");
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    await client.messages.create({
      body: `Your AqarNow verification code is: ${code}. Valid for 10 minutes. Do not share this code.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    console.log(`✅ OTP sent to ${phone}`);
  } else {
    // Development fallback
    console.log(`📱 [DEV] OTP for ${phone}: ${code}`);
  }
};

module.exports = { sendOTP };
