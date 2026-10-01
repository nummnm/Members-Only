const crypto = require("node:crypto");
const fs = require("node:fs");
const multer = require("multer");
const path = require("node:path");

const uploadDirectory = path.join(__dirname, "..", "public", "uploads", "avatars");
fs.mkdirSync(uploadDirectory, { recursive: true });

const extensionsByMimeType = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename(req, file, callback) {
    const extension = extensionsByMimeType[file.mimetype];
    callback(null, `${req.user.id}-${crypto.randomUUID()}${extension}`);
  },
});

const uploadProfileIcon = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    if (!extensionsByMimeType[file.mimetype]) {
      return callback(new Error("Choose a PNG, JPEG, or WebP image."));
    }
    callback(null, true);
  },
});

module.exports = { uploadDirectory, uploadProfileIcon };
