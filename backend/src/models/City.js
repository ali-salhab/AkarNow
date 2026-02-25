/**
 * City Model
 * Represents cities/regions available in the app
 * Supports bilingual (Arabic/English) names
 */

const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    nameAr: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      default: "Saudi Arabia",
    },
    countryCode: {
      type: String,
      default: "SA",
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    propertiesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

citySchema.index({ name: 1, countryCode: 1 });

module.exports = mongoose.model("City", citySchema);
