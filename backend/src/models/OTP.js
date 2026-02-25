/**
 * OTP Model
 * Stores temporary OTP codes for phone verification
 * TTL index auto-expires documents after 10 minutes
 */

const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
    },

    // How many times this OTP has been attempted (brute-force protection)
    attempts: {
      type: Number,
      default: 0,
      max: [5, "Maximum OTP attempts exceeded"],
    },

    isUsed: {
      type: Boolean,
      default: false,
    },

    // TTL: MongoDB auto-deletes document 10 minutes after creation
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000),
    },
  },
  { timestamps: true },
);

// TTL index — auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for fast lookup
otpSchema.index({ phone: 1, isUsed: 1 });

module.exports = mongoose.model("OTP", otpSchema);
