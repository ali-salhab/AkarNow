/**
 * Auth Controller
 * Phone + OTP based authentication flow
 * Step 1: sendOTP → Step 2: verifyOTP → returns JWT
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OTP = require("../models/OTP");
const { generateToken } = require("../utils/generateToken");
const { sendOTP } = require("../utils/otpService");

/**
 * @desc    Send OTP to phone number
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOTPHandler = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    // Invalidate any existing OTPs for this phone
    await OTP.deleteMany({ phone });

    // Generate 6-digit OTP
    const code =
      process.env.OTP_BYPASS === "true"
        ? process.env.DEV_OTP || "123456"
        : Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB
    await OTP.create({ phone, code });

    // Send via Twilio (or bypass in dev)
    if (process.env.OTP_BYPASS !== "true") {
      await sendOTP(phone, code);
    }

    res.status(200).json({
      success: true,
      message: `OTP sent to ${phone}`,
      // Only expose in development for testing
      ...(process.env.NODE_ENV === "development" && { devCode: code }),
    });
  } catch (error) {
    console.error("sendOTP error:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

/**
 * @desc    Verify OTP and authenticate user
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTPHandler = async (req, res) => {
  try {
    const { phone, code, name } = req.body;

    if (!phone || !code) {
      return res
        .status(400)
        .json({ success: false, message: "Phone and OTP code are required" });
    }

    // Find the latest OTP for this phone
    const otpDoc = await OTP.findOne({ phone, isUsed: false }).sort({
      createdAt: -1,
    });

    if (!otpDoc) {
      return res
        .status(400)
        .json({
          success: false,
          message: "OTP not found or already used. Please request a new one.",
        });
    }

    // Check expiry
    if (new Date() > otpDoc.expiresAt) {
      await OTP.findByIdAndDelete(otpDoc._id);
      return res
        .status(400)
        .json({
          success: false,
          message: "OTP has expired. Please request a new one.",
        });
    }

    // Check attempt limit
    if (otpDoc.attempts >= 5) {
      await OTP.findByIdAndDelete(otpDoc._id);
      return res
        .status(400)
        .json({
          success: false,
          message: "Too many failed attempts. Please request a new OTP.",
        });
    }

    // Verify code
    if (otpDoc.code !== code.toString()) {
      await OTP.findByIdAndUpdate(otpDoc._id, { $inc: { attempts: 1 } });
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code",
        attemptsLeft: 5 - (otpDoc.attempts + 1),
      });
    }

    // Mark OTP as used
    await OTP.findByIdAndUpdate(otpDoc._id, { isUsed: true });

    // Find or create user (phone-based auth)
    let user = await User.findOne({ phone });
    const isNewUser = !user;

    if (!user) {
      user = await User.create({
        phone,
        name: name || "",
        isVerified: true,
        lastLogin: new Date(),
      });
    } else {
      // Update existing user
      user.isVerified = true;
      user.lastLogin = new Date();
      if (name && !user.name) user.name = name;
      await user.save();
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: isNewUser ? "Account created successfully" : "Login successful",
      isNewUser,
      token,
      user: {
        _id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("verifyOTP error:", error);
    res.status(500).json({ success: false, message: "Authentication failed" });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-__v");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email, pushToken, preferredLanguage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, pushToken, preferredLanguage },
      { new: true, runValidators: true },
    ).select("-__v");

    res.json({ success: true, user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
};

module.exports = { sendOTPHandler, verifyOTPHandler, getMe, updateProfile };
