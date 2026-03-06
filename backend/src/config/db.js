/**
 * MongoDB Connection Configuration
 * Uses Mongoose with connection pooling and error handling
 */

const mongoose = require("mongoose");

const seedAdminUser = async () => {
  try {
    const User = require("../models/User");
    const existing = await User.findOne({ role: "admin" });
    if (existing) {
      console.log("👤 Admin user already exists");
      return;
    }
    const email = process.env.ADMIN_EMAIL || "admin@aqarnow.com";
    const password = process.env.ADMIN_PASSWORD || "Admin@AqarNow2025";
    await User.create({
      phone: "+9660000000000",
      name: "AqarNow Admin",
      email,
      role: "admin",
      isVerified: true,
      isActive: true,
      password, // pre-save hook hashes it
    });
    console.log(`✅ Admin user auto-created: ${email}`);
  } catch (err) {
    console.error("⚠️  Admin seed error:", err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8+ handles these automatically
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await seedAdminUser();
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("disconnected", () => {
  console.log("⚠️  MongoDB Disconnected");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed on app termination");
  process.exit(0);
});

module.exports = connectDB;
