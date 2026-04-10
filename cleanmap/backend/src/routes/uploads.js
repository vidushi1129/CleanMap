const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");

const router = express.Router();

// ── Ensure uploads dir exists ─────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, "../../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Multer config ─────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename:    (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${ext}`);
  },
});

const fileFilter = (_, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── POST /api/uploads/image ───────────────────────────────────────────
router.post("/image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: "No file uploaded" });
  const url = `${process.env.API_URL || "http://localhost:5000"}/uploads/${req.file.filename}`;
  res.status(201).json({ ok: true, url });
});

// ── Multer error handler ──────────────────────────────────────────────
router.use((err, _, res, next) => {
  if (err instanceof multer.MulterError || err.message) {
    return res.status(400).json({ ok: false, message: err.message });
  }
  next(err);
});

module.exports = router;
