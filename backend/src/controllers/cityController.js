/**
 * City Controller
 */

const City = require("../models/City");

const getCities = async (req, res) => {
  try {
    const cities = await City.find({ isActive: true }).sort({ name: 1 }).lean();
    res.json({ success: true, data: cities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch cities" });
  }
};

const createCity = async (req, res) => {
  try {
    const city = await City.create(req.body);
    res.status(201).json({ success: true, data: city });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getCities, createCity };
