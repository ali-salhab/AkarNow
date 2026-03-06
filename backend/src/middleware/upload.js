/**
 * Multer upload middleware — streams property images directly to Cloudinary.
 * No files are ever written to local disk.
 */

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "akarnow/properties",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, png, webp, gif)"), false);
  }
};

const uploadPropertyImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 }, // 10MB per file, max 10
}).array("images", 10);

module.exports = { uploadPropertyImages, cloudinary };
