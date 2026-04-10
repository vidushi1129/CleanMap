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
// Optional query: ?status=PENDING|IN_PROGRESS|CLEANED|PENDING_PROOF
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

// ── GET /api/reports/leaderboard ──────────────────────────────────────
router.get("/leaderboard", (_, res) => {
  res.json({ ok: true, data: store.leaderboard() });
});

// ── SSE /api/reports/stream ───────────────────────────────────────────
// Server-Sent Events endpoint for real-time updates.
router.get("/stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });
  res.write("\n");

  // Send initial state
  const initData = {
    reports: store.getAll(),
    stats: store.stats(),
    leaderboard: store.leaderboard(),
  };
  res.write(`event: update\ndata: ${JSON.stringify(initData)}\n\n`);

  // Register SSE client
  store.addSSEClient(res);

  // Keep-alive every 30s
  const keepAlive = setInterval(() => {
    try { res.write(":keepalive\n\n"); } catch {}
  }, 30000);

  req.on("close", () => clearInterval(keepAlive));
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
// Body: { volunteerName, afterImageUrl }
// If afterImageUrl is provided → status = CLEANED
// If afterImageUrl is missing → status = PENDING_PROOF
router.patch("/:id/clean",
  param("id").isString(),
  body("volunteerName").isString().trim().notEmpty().isLength({ max: 80 }),
  body("afterImageUrl").optional().isString(),
  validate,
  (req, res) => {
    const report = store.getById(req.params.id);
    if (!report) return res.status(404).json({ ok: false, message: "Report not found" });
    if (report.status !== "IN_PROGRESS" && report.status !== "PENDING_PROOF") {
      return res.status(409).json({ ok: false, message: `Cannot mark clean — status is '${report.status}'` });
    }

    const afterImageUrl = req.body.afterImageUrl || null;
    const newStatus = afterImageUrl ? "CLEANED" : "PENDING_PROOF";

    const updated = store.update(req.params.id, {
      status: newStatus,
      claimedBy: req.body.volunteerName,
      afterImageUrl,
    });
    res.json({ ok: true, data: updated });
  }
);

// ── PATCH /api/reports/:id/proof ──────────────────────────────────────
// Upload after photo to move from PENDING_PROOF → CLEANED
// Body: { afterImageUrl }
router.patch("/:id/proof",
  param("id").isString(),
  body("afterImageUrl").isString().notEmpty(),
  validate,
  (req, res) => {
    const report = store.getById(req.params.id);
    if (!report) return res.status(404).json({ ok: false, message: "Report not found" });
    if (report.status !== "PENDING_PROOF") {
      return res.status(409).json({ ok: false, message: `Report status is '${report.status}', expected PENDING_PROOF` });
    }
    const updated = store.update(req.params.id, {
      status: "CLEANED",
      afterImageUrl: req.body.afterImageUrl,
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
