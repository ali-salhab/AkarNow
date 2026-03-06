const express = require("express");
const router = express.Router();
const {
  sendOTPHandler,
  verifyOTPHandler,
  registerHandler,
  loginHandler,
  getMe,
  updateProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// @route  POST /api/auth/register  (new user → sends OTP)
router.post("/register", registerHandler);

// @route  POST /api/auth/login  (phone + password → sends OTP)
router.post("/login", loginHandler);

// @route  POST /api/auth/send-otp
router.post("/send-otp", sendOTPHandler);

// @route  POST /api/auth/verify-otp
router.post("/verify-otp", verifyOTPHandler);

// @route  GET /api/auth/me
router.get("/me", protect, getMe);

// @route  PUT /api/auth/profile
router.put("/profile", protect, updateProfile);

module.exports = router;
