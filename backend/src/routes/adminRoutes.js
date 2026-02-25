const express = require("express");
const router = express.Router();
const {
  adminLogin,
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getPropertiesAdmin,
  updatePropertyAdmin,
  deletePropertyAdmin,
  getCitiesAdmin,
  createCityAdmin,
  updateCityAdmin,
  deleteCityAdmin,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ─── Public ───────────────────────────────────────────────────────────────────
router.post("/login", adminLogin);

// All routes below require admin JWT
router.use(protect, adminOnly);

// ─── Stats ────────────────────────────────────────────────────────────────────
router.get("/stats", getDashboardStats);

// ─── Users ────────────────────────────────────────────────────────────────────
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// ─── Properties ───────────────────────────────────────────────────────────────
router.get("/properties", getPropertiesAdmin);
router.patch("/properties/:id", updatePropertyAdmin);
router.delete("/properties/:id", deletePropertyAdmin);

// ─── Cities ───────────────────────────────────────────────────────────────────
router.get("/cities", getCitiesAdmin);
router.post("/cities", createCityAdmin);
router.put("/cities/:id", updateCityAdmin);
router.delete("/cities/:id", deleteCityAdmin);

module.exports = router;
