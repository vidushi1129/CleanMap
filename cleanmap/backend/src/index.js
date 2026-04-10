require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const reportsRouter = require("./routes/reports");
const uploadsRouter = require("./routes/uploads");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & logging ──────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan("dev"));

// ── CORS ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Body parsers ──────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Static uploads ────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── Routes ────────────────────────────────────────────────────────────
app.use("/api/reports", reportsRouter);
app.use("/api/uploads", uploadsRouter);

// ── Health check ──────────────────────────────────────────────────────
app.get("/api/health", (_, res) => res.json({ status: "ok", time: new Date() }));

// ── Error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => console.log(`✅  CleanMap API running on http://localhost:${PORT}`));
module.exports = app;
