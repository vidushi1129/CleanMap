// ── Global error handler ──────────────────────────────────────────────
// Must have 4 parameters so Express recognises it as an error handler.
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  console.error("[ERROR]", err.message || err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    ok: false,
    message: status === 500 ? "Internal server error" : err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
