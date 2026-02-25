/**
 * Favorite Model
 * Many-to-many relationship between users and properties
 */

const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
  },
  { timestamps: true },
);

// Ensure a user can only favorite a property once
favoriteSchema.index({ user: 1, property: 1 }, { unique: true });

// After saving, increment property's favoritesCount
favoriteSchema.post("save", async function () {
  const Property = require("./Property");
  await Property.findByIdAndUpdate(this.property, {
    $inc: { favoritesCount: 1 },
  });
});

// After removing, decrement property's favoritesCount
favoriteSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const Property = require("./Property");
    await Property.findByIdAndUpdate(doc.property, {
      $inc: { favoritesCount: -1 },
    });
  }
});

module.exports = mongoose.model("Favorite", favoriteSchema);
