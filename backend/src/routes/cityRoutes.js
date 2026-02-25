const express = require("express");
const router = express.Router();
const { getCities, createCity } = require("../controllers/cityController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// @route  GET /api/cities
router.get("/", getCities);

// @route  POST /api/cities (admin only)
router.post("/", protect, adminOnly, createCity);

module.exports = router;
