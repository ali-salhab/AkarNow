/**
 * Admin Controller
 * Full admin dashboard API — stats, user mgmt, property mgmt, city mgmt
 */

const User = require("../models/User");
const Property = require("../models/Property");
const Favorite = require("../models/Favorite");
const City = require("../models/City");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/generateToken");

// ─── Auth ──────────────────────────────────────────────────────────────────────

/**
 * @desc   Admin login (email + password)
 * @route  POST /api/admin/login
 * @access Public
 */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email, role: "admin" }).select(
      "+password",
    );
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

/**
 * @desc   Get dashboard overview stats
 * @route  GET /api/admin/stats
 * @access Admin
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersThisMonth,
      totalProperties,
      newPropertiesThisMonth,
      activeProperties,
      featuredProperties,
      totalFavorites,
      totalCities,
      // property breakdown by type
      propertyByType,
      // property breakdown by listing
      propertyByListing,
      // top cities by property count
      topCities,
      // daily new users last 7 days
      dailyUsers,
      // daily new properties last 7 days
      dailyProperties,
      totalViews,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      User.countDocuments({
        role: { $ne: "admin" },
        createdAt: { $gte: thirtyDaysAgo },
      }),
      Property.countDocuments(),
      Property.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Property.countDocuments({ status: "available" }),
      Property.countDocuments({ isFeatured: true }),
      Favorite.countDocuments(),
      Property.aggregate([
        { $match: { city: { $ne: null, $ne: "" } } },
        { $group: { _id: "$city" } },
        { $count: "total" },
      ]).then((r) => r[0]?.total || 0),
      Property.aggregate([
        { $group: { _id: "$propertyType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Property.aggregate([
        { $group: { _id: "$listingType", count: { $sum: 1 } } },
      ]),
      Property.aggregate([
        { $match: { city: { $ne: null, $ne: "" } } },
        { $group: { _id: "$city", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { count: 1, name: "$_id" } },
      ]),
      User.aggregate([
        {
          $match: { createdAt: { $gte: sevenDaysAgo }, role: { $ne: "admin" } },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Property.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Property.aggregate([
        { $group: { _id: null, total: { $sum: "$viewsCount" } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          newUsersThisMonth,
          totalProperties,
          newPropertiesThisMonth,
          activeProperties,
          featuredProperties,
          totalFavorites,
          totalCities,
          totalViews: totalViews[0]?.total || 0,
        },
        charts: {
          propertyByType,
          propertyByListing,
          topCities,
          dailyUsers,
          dailyProperties,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Users Management ─────────────────────────────────────────────────────────

/**
 * @desc   Get all users (paginated + search)
 * @route  GET /api/admin/users
 */
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const skip = (page - 1) * limit;

    const query = { role: { $ne: "admin" } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) query.role = role;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get single user with their properties + favorites count
 * @route  GET /api/admin/users/:id
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-__v");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const [propertiesCount, favoritesCount] = await Promise.all([
      Property.countDocuments({ owner: user._id }),
      Favorite.countDocuments({ user: user._id }),
    ]);

    res.json({
      success: true,
      data: { ...user.toObject(), propertiesCount, favoritesCount },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Update user (role, isActive, name)
 * @route  PUT /api/admin/users/:id
 */
exports.updateUser = async (req, res) => {
  try {
    const allowedFields = ["name", "role", "isActive", "email"];
    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-__v");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Delete user and all their content
 * @route  DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Cascade delete
    await Promise.all([
      Property.deleteMany({ owner: user._id }),
      Favorite.deleteMany({ user: user._id }),
      user.deleteOne(),
    ]);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Properties Management ────────────────────────────────────────────────────

/**
 * @desc   Get all properties (paginated + filters)
 * @route  GET /api/admin/properties
 */
exports.getPropertiesAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const listingType = req.query.listingType || "";
    const approvalStatus = req.query.approvalStatus || "";
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { district: { $regex: search, $options: "i" } },
      ];
    }
    if (status) query.status = status;
    if (listingType) query.listingType = listingType;
    if (approvalStatus) query.approvalStatus = approvalStatus;

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate("owner", "name phone")
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Property.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Update property status or featured flag (admin override)
 * @route  PATCH /api/admin/properties/:id
 */
exports.updatePropertyAdmin = async (req, res) => {
  try {
    const allowedFields = [
      "status",
      "isFeatured",
      "isVerified",
      "title",
      "titleAr",
      "description",
      "listingType",
      "propertyType",
      "price",
      "currency",
      "area",
      "rooms",
      "bathrooms",
      "city",
      "district",
      "address",
      "contactPhone",
    ];
    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    // If new images uploaded, replace images array (Cloudinary — f.path is the CDN URL)
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => f.path);
      updates.images = newImages;
      updates.coverImage = newImages[0];
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).populate("owner", "name phone");

    if (!property)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });

    res.json({ success: true, data: property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Delete a property (admin)
 * @route  DELETE /api/admin/properties/:id
 */
exports.deletePropertyAdmin = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });

    await Favorite.deleteMany({ property: req.params.id });

    res.json({ success: true, message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Cities Management ────────────────────────────────────────────────────────

/**
 * @desc   Get all cities (admin view — includes inactive)
 * @route  GET /api/admin/cities
 */
exports.getCitiesAdmin = async (req, res) => {
  try {
    const cities = await City.find()
      .sort({ propertiesCount: -1 })
      .select("-__v");

    // Attach live property count
    const withCounts = await Promise.all(
      cities.map(async (city) => {
        const count = await Property.countDocuments({
          city: city._id,
          status: "active",
        });
        return { ...city.toObject(), liveCount: count };
      }),
    );

    res.json({ success: true, data: withCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Create a city
 * @route  POST /api/admin/cities
 */
exports.createCityAdmin = async (req, res) => {
  try {
    const { name, nameAr, countryCode } = req.body;
    if (!name || !nameAr || !countryCode) {
      return res.status(400).json({
        success: false,
        message: "name, nameAr and countryCode required",
      });
    }
    const city = await City.create({ name, nameAr, countryCode });
    res.status(201).json({ success: true, data: city });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "City already exists" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Update a city
 * @route  PUT /api/admin/cities/:id
 */
exports.updateCityAdmin = async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    ).select("-__v");

    if (!city)
      return res
        .status(404)
        .json({ success: false, message: "City not found" });

    res.json({ success: true, data: city });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Delete a city
 * @route  DELETE /api/admin/cities/:id
 */
exports.deleteCityAdmin = async (req, res) => {
  try {
    const hasProperties = await Property.exists({ city: req.params.id });
    if (hasProperties) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete city with active properties",
      });
    }
    await City.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "City deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Property Approval ────────────────────────────────────────────────────────

/**
 * @desc   Create a property (admin)
 * @route  POST /api/admin/properties
 */
exports.createPropertyAdmin = async (req, res) => {
  try {
    // Build images array from uploaded files (Cloudinary — f.path is the CDN URL)
    const uploadedImages = req.files
      ? req.files.map((f) => f.path)
      : [];

    const property = await Property.create({
      ...req.body,
      images: uploadedImages,
      coverImage: uploadedImages[0] || null,
      approvalStatus: "approved",
    });
    const populated = await property.populate("owner", "name phone");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Approve a pending property
 * @route  PATCH /api/admin/properties/:id/approve
 */
exports.approveProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: { approvalStatus: "approved", rejectionReason: null } },
      { new: true },
    ).populate("owner", "name phone");

    if (!property)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });

    res.json({ success: true, data: property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Reject a pending property
 * @route  PATCH /api/admin/properties/:id/reject
 */
exports.rejectProperty = async (req, res) => {
  try {
    const { reason } = req.body;
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          approvalStatus: "rejected",
          rejectionReason: reason || null,
        },
      },
      { new: true },
    ).populate("owner", "name phone");

    if (!property)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });

    res.json({ success: true, data: property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── User Verifications ───────────────────────────────────────────────────────

/**
 * @desc   Get users who have requested agent verification
 * @route  GET /api/admin/verifications
 */
exports.getVerifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || "pending";
    const skip = (page - 1) * limit;

    const query = { verificationStatus: status };

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Approve a user verification request
 * @route  PATCH /api/admin/verifications/:id/approve
 */
exports.approveVerification = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          verificationStatus: "verified",
          isVerified: true,
          role: "agent",
          verificationRejectionReason: null,
        },
      },
      { new: true },
    ).select("-__v");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Reject a user verification request
 * @route  PATCH /api/admin/verifications/:id/reject
 */
exports.rejectVerification = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          verificationStatus: "rejected",
          verificationRejectionReason: reason || null,
        },
      },
      { new: true },
    ).select("-__v");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
