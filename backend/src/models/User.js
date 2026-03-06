/**
 * User Model
 * Handles phone-based authentication for Middle East market
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Phone number as primary identifier (Middle East market)
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^\+?[1-9]\d{7,14}$/, "Please enter a valid phone number"],
    },

    name: {
      type: String,
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true, // allows null/undefined but enforces uniqueness when present
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    avatar: {
      type: String,
      default: null,
    },

    // User role for future admin features
    role: {
      type: String,
      enum: ["user", "agent", "admin"],
      default: "user",
    },

    // Account status
    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Push notification token (Expo)
    pushToken: {
      type: String,
      default: null,
    },

    // Preferences
    preferredLanguage: {
      type: String,
      enum: ["ar", "en"],
      default: "ar",
    },

    savedSearches: [
      {
        query: String,
        filters: mongoose.Schema.Types.Mixed,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    lastLogin: {
      type: Date,
      default: null,
    },

    // Admin-only password field (phone users have no password)
    password: {
      type: String,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for favorites count
userSchema.virtual("favoritesCount", {
  ref: "Favorite",
  localField: "_id",
  foreignField: "user",
  count: true,
});

// Index for performance
userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
