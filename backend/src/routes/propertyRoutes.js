const express = require("express");
const router = express.Router();
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getSearchSuggestions,
} = require("../controllers/propertyController");
const { protect } = require("../middleware/authMiddleware");

// @route  GET /api/properties/featured
router.get("/featured", getFeaturedProperties);

// @route  GET /api/properties/suggestions
router.get("/suggestions", getSearchSuggestions);

// @route  GET /api/properties
router.get("/", getProperties);

// @route  POST /api/properties
router.post("/", protect, createProperty);

// @route  GET /api/properties/:id
router.get("/:id", getPropertyById);

// @route  PUT /api/properties/:id
router.put("/:id", protect, updateProperty);

// @route  DELETE /api/properties/:id
router.delete("/:id", protect, deleteProperty);

module.exports = router;
