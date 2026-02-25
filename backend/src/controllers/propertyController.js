/**
 * Property Controller
 * Full CRUD + advanced filtering + text search + pagination
 */

const Property = require("../models/Property");
const City = require("../models/City");

/**
 * @desc    Get all properties with filtering, search, and pagination
 * @route   GET /api/properties
 * @access  Public
 */
const getProperties = async (req, res) => {
  try {
    const {
      search,
      city,
      listingType,
      propertyType,
      minPrice,
      maxPrice,
      minRooms,
      maxRooms,
      viewType,
      amenities,
      minArea,
      maxArea,
      isFeatured,
      status = "available",
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter object
    const filter = { status };

    // Text search (uses MongoDB text index)
    if (search) {
      filter.$text = { $search: search };
    }

    if (city) filter.city = city;
    if (listingType) filter.listingType = listingType;
    if (propertyType) filter.propertyType = propertyType;
    if (isFeatured === "true") filter.isFeatured = true;

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Rooms range
    if (minRooms || maxRooms) {
      filter.rooms = {};
      if (minRooms) filter.rooms.$gte = Number(minRooms);
      if (maxRooms) filter.rooms.$lte = Number(maxRooms);
    }

    // Area range
    if (minArea || maxArea) {
      filter.area = {};
      if (minArea) filter.area.$gte = Number(minArea);
      if (maxArea) filter.area.$lte = Number(maxArea);
    }

    // View types (comma-separated)
    if (viewType) {
      filter.viewType = { $in: viewType.split(",") };
    }

    // Amenities (comma-separated, must have all)
    if (amenities) {
      filter.amenities = { $all: amenities.split(",") };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;
    // Always add text score sort if searching
    if (search) sortObj.score = { $meta: "textScore" };

    // Execute query with populate
    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate("city", "name nameAr countryCode")
        .select("-__v")
        .lean(),
      Property.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: properties,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("getProperties error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch properties" });
  }
};

/**
 * @desc    Get single property by ID
 * @route   GET /api/properties/:id
 * @access  Public
 */
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("city", "name nameAr countryCode")
      .populate("owner", "name phone avatar")
      .select("-__v");

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    // Increment view count asynchronously
    Property.findByIdAndUpdate(req.params.id, {
      $inc: { viewsCount: 1 },
    }).exec();

    res.json({ success: true, data: property });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch property" });
  }
};

/**
 * @desc    Create a new property
 * @route   POST /api/properties
 * @access  Private
 */
const createProperty = async (req, res) => {
  try {
    const property = await Property.create({
      ...req.body,
      owner: req.user._id,
    });

    const populated = await property.populate("city", "name nameAr");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("createProperty error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update a property
 * @route   PUT /api/properties/:id
 * @access  Private (owner only)
 */
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    // Only owner or admin can update
    if (
      property.owner?.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("city", "name nameAr");

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a property
 * @route   DELETE /api/properties/:id
 * @access  Private (owner or admin)
 */
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    if (
      property.owner?.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Property deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete property" });
  }
};

/**
 * @desc    Get featured properties
 * @route   GET /api/properties/featured
 * @access  Public
 */
const getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      isFeatured: true,
      status: "available",
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("city", "name nameAr")
      .lean();

    res.json({ success: true, data: properties });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch featured properties" });
  }
};

/**
 * @desc    Search suggestions (autocomplete)
 * @route   GET /api/properties/suggestions
 * @access  Public
 */
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const regex = new RegExp(q, "i");

    const [properties, cities] = await Promise.all([
      Property.find({
        $or: [{ title: regex }, { titleAr: regex }, { district: regex }],
        status: "available",
      })
        .limit(5)
        .select("title titleAr district")
        .lean(),
      City.find({ $or: [{ name: regex }, { nameAr: regex }] })
        .limit(3)
        .select("name nameAr")
        .lean(),
    ]);

    const suggestions = [
      ...cities.map((c) => ({
        type: "city",
        id: c._id,
        label: c.name,
        labelAr: c.nameAr,
      })),
      ...properties.map((p) => ({
        type: "property",
        id: p._id,
        label: p.title,
        labelAr: p.titleAr,
      })),
    ];

    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Search failed" });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getSearchSuggestions,
};
