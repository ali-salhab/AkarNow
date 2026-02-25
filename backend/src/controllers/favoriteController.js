/**
 * Favorite Controller
 * Toggle favorites + list user's favorites
 */

const Favorite = require("../models/Favorite");
const Property = require("../models/Property");

/**
 * @desc    Toggle favorite (add/remove)
 * @route   POST /api/favorites/:propertyId
 * @access  Private
 */
const toggleFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user._id;

    const existing = await Favorite.findOne({
      user: userId,
      property: propertyId,
    });

    if (existing) {
      await Favorite.findOneAndDelete({ user: userId, property: propertyId });
      return res.json({
        success: true,
        isFavorited: false,
        message: "Removed from favorites",
      });
    }

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    await Favorite.create({ user: userId, property: propertyId });
    res
      .status(201)
      .json({
        success: true,
        isFavorited: true,
        message: "Added to favorites",
      });
  } catch (error) {
    console.error("toggleFavorite error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update favorites" });
  }
};

/**
 * @desc    Get user's favorite properties
 * @route   GET /api/favorites
 * @access  Private
 */
const getFavorites = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [favorites, total] = await Promise.all([
      Favorite.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate({
          path: "property",
          populate: { path: "city", select: "name nameAr" },
        })
        .lean(),
      Favorite.countDocuments({ user: req.user._id }),
    ]);

    // Extract properties (filter out deleted ones)
    const properties = favorites
      .filter((f) => f.property)
      .map((f) => ({ ...f.property, favoritedAt: f.createdAt }));

    res.json({
      success: true,
      data: properties,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch favorites" });
  }
};

/**
 * @desc    Check if properties are favorited by current user
 * @route   POST /api/favorites/check
 * @access  Private
 */
const checkFavorites = async (req, res) => {
  try {
    const { propertyIds } = req.body;

    if (!Array.isArray(propertyIds)) {
      return res
        .status(400)
        .json({ success: false, message: "propertyIds must be an array" });
    }

    const favorites = await Favorite.find({
      user: req.user._id,
      property: { $in: propertyIds },
    }).select("property");

    const favoritedIds = favorites.map((f) => f.property.toString());

    const result = {};
    propertyIds.forEach((id) => {
      result[id] = favoritedIds.includes(id.toString());
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to check favorites" });
  }
};

module.exports = { toggleFavorite, getFavorites, checkFavorites };
