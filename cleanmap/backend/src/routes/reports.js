const express = require("express");
const { body, param, validationResult } = require("express-validator");
const store = require("../models/store");

const router = express.Router();

// ── Validation helpers ─────────────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const reportRules = [
  body("lat").isFloat({ min: -90, max: 90 }).withMessage("lat must be a valid latitude"),
  body("lng").isFloat({ min: -180, max: 180 }).withMessage("lng must be a valid longitude"),
  body("severity").isIn(["Low", "Medium", "High"]).withMessage("severity must be Low, Medium, or High"),
  body("reporter").optional().isString().trim().isLength({ max: 80 }),
  body("description").optional().isString().trim().isLength({ max: 500 }),
  body("location").optional().isString().trim().isLength({ max: 200 }),
  body("imageUrl").optional().isString(),
];

// ── GET /api/reports ──────────────────────────────────────────────────
// Returns all reports sorted newest-first.
// Optional query: ?status=PENDING|IN_PROGRESS|CLEANED
router.get("/", (req, res) => {
  let reports = store.getAll();
  if (req.query.status) {
    reports = reports.filter(r => r.status === req.query.status);
  }
  res.json({ ok: true, data: reports, stats: store.stats() });
});

// ── GET /api/reports/stats ────────────────────────────────────────────
router.get("/stats", (_, res) => {
  res.json({ ok: true, data: store.stats() });
});

// ── GET /api/reports/:id ──────────────────────────────────────────────
router.get("/:id",
  param("id").isString(),
  validate,
  (req, res) => {
    const report = store.getById(req.params.id);
    if (!report) return res.status(404).json({ ok: false, message: "Report not found" });
    res.json({ ok: true, data: report });
  }
);

// ── POST /api/reports ─────────────────────────────────────────────────
// Body: { lat, lng, severity, description?, reporter?, location?, imageUrl? }
router.post("/", reportRules, validate, (req, res) => {
  const { lat, lng, severity, description, reporter, location, imageUrl } = req.body;
  const report = store.create({ lat, lng, severity, description, reporter, location, imageUrl });
  res.status(201).json({ ok: true, data: report });
});

// ── PATCH /api/reports/:id/claim ──────────────────────────────────────
// Body: { volunteerName }
router.patch("/:id/claim",
  param("id").isString(),
  body("volunteerName").isString().trim().notEmpty().isLength({ max: 80 }),
  validate,
  (req, res) => {
    const report = store.getById(req.params.id);
    if (!report) return res.status(404).json({ ok: false, message: "Report not found" });
    if (report.status !== "PENDING") {
      return res.status(409).json({ ok: false, message: `Cannot claim a report with status '${report.status}'` });
    }
    const updated = store.update(req.params.id, {
      status: "IN_PROGRESS",
      claimedBy: req.body.volunteerName,
    });
    res.json({ ok: true, data: updated });
  }
);

// ── PATCH /api/reports/:id/clean ──────────────────────────────────────
// Body: { volunteerName }
router.patch("/:id/clean",
  param("id").isString(),
  body("volunteerName").isString().trim().notEmpty().isLength({ max: 80 }),
  validate,
  (req, res) => {
    const report = store.getById(req.params.id);
    if (!report) return res.status(404).json({ ok: false, message: "Report not found" });
    if (report.status !== "IN_PROGRESS") {
      return res.status(409).json({ ok: false, message: `Cannot mark clean — status is '${report.status}'` });
    }
    const updated = store.update(req.params.id, {
      status: "CLEANED",
      claimedBy: req.body.volunteerName,
    });
    res.json({ ok: true, data: updated });
  }
);

// ── DELETE /api/reports/:id ───────────────────────────────────────────
router.delete("/:id",
  param("id").isString(),
  validate,
  (req, res) => {
    const deleted = store.remove(req.params.id);
    if (!deleted) return res.status(404).json({ ok: false, message: "Report not found" });
    res.json({ ok: true, message: "Deleted" });
  }
);

module.exports = router;
