const express = require("express");
const router = express.Router();
const {
  toggleFavorite,
  getFavorites,
  checkFavorites,
} = require("../controllers/favoriteController");
const { protect } = require("../middleware/authMiddleware");

// All favorite routes are protected
router.use(protect);

// @route  GET /api/favorites
router.get("/", getFavorites);

// @route  POST /api/favorites/check
router.post("/check", checkFavorites);

// @route  POST /api/favorites/:propertyId
router.post("/:propertyId", toggleFavorite);

module.exports = router;
