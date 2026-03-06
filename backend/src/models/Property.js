/**
 * Property Model
 * Core model for real estate listings
 * Supports Rent/Sale/Buy categories with rich filtering metadata
 */

const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    // ─── Basic Info ────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    titleAr: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    descriptionAr: {
      type: String,
    },

    // ─── Category & Type ──────────────────────────────────────────────────
    listingType: {
      type: String,
      enum: ["rent", "sale", "buy"],
      required: [true, "Listing type is required"],
    },

    propertyType: {
      type: String,
      enum: [
        "apartment",
        "villa",
        "chalet",
        "studio",
        "office",
        "land",
        "warehouse",
      ],
      required: [true, "Property type is required"],
    },

    // ─── Pricing ──────────────────────────────────────────────────────────
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    currency: {
      type: String,
      enum: ["SAR", "AED", "KWD", "BHD", "QAR", "OMR", "EGP", "USD"],
      default: "SAR",
    },

    // Rent period (monthly, yearly, etc.)
    rentPeriod: {
      type: String,
      enum: ["daily", "monthly", "quarterly", "yearly"],
      default: "yearly",
    },

    // ─── Location ─────────────────────────────────────────────────────────
    city: {
      type: String,
      trim: true,
    },

    district: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },

    // ─── Details ──────────────────────────────────────────────────────────
    area: {
      type: Number, // in m²
      required: [true, "Area is required"],
      min: [1, "Area must be at least 1 m²"],
    },

    rooms: {
      type: Number,
      min: [0, "Rooms cannot be negative"],
      default: 0,
    },

    bathrooms: {
      type: Number,
      min: [0, "Bathrooms cannot be negative"],
      default: 0,
    },

    floors: {
      type: Number,
      default: 1,
    },

    floorNumber: {
      type: Number,
      default: 1,
    },

    // ─── View & Features ──────────────────────────────────────────────────
    viewType: {
      type: [String],
      enum: ["sea", "garden", "city", "pool", "street", "mountain", "desert"],
      default: [],
    },

    amenities: {
      type: [String],
      enum: [
        "parking",
        "gym",
        "pool",
        "security",
        "elevator",
        "balcony",
        "maid_room",
        "storage",
        "central_ac",
        "kitchen",
        "furnished",
        "semi_furnished",
        "internet",
        "satellite",
        "playground",
      ],
      default: [],
    },

    // ─── Media ────────────────────────────────────────────────────────────
    images: {
      type: [String], // Array of image URLs
      validate: {
        validator: (v) => v.length <= 20,
        message: "Cannot have more than 20 images",
      },
    },

    coverImage: {
      type: String,
      default: null,
    },

    // ─── Contact ──────────────────────────────────────────────────────────
    contactPhone: {
      type: String,
      required: [true, "Contact phone is required"],
    },

    contactWhatsApp: {
      type: String,
    },

    agentName: {
      type: String,
      trim: true,
    },

    agentAvatar: {
      type: String,
    },

    // ─── Status & Meta ────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["available", "rented", "sold", "reserved", "inactive"],
      default: "available",
    },
    // Admin approval before property is publicly visible
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    viewsCount: {
      type: Number,
      default: 0,
    },

    favoritesCount: {
      type: Number,
      default: 0,
    },

    // Owner reference
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes for fast filtering & search ───────────────────────────────────────
propertySchema.index({ city: 1, listingType: 1, status: 1 });
propertySchema.index({ propertyType: 1, price: 1 });
propertySchema.index({ isFeatured: -1, createdAt: -1 });
propertySchema.index({ rooms: 1 });
propertySchema.index({ viewType: 1 });

// Text index for search
propertySchema.index({
  title: "text",
  titleAr: "text",
  description: "text",
  district: "text",
  address: "text",
});

module.exports = mongoose.model("Property", propertySchema);
