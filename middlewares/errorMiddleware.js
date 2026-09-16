/**
 * Catch-all middleware for unmatched routes (404 Not Found).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: `Route ${req.originalUrl} not found`,
    code: "NOT_FOUND",
  });
};

/**
 * Global error handling middleware for Express.
 * Catches all errors passed via next(error) and formats response.
 *
 * Handles:
 * - MongoDB duplicate key errors (E11000) → 409 Conflict
 * - Custom status/statusCode on error objects
 * - Falls back to 500 Internal Server Error
 *
 * @param {Error & { status?: number, statusCode?: number, code?: string, keyValue?: object }} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const errorHandler = (err, req, res, next) => {
  // Log full stack only outside production to keep prod logs clean
  if (process.env.NODE_ENV === "production") {
    // Short log in production (no stack) — keeps Docker logs readable
    console.error(`[ERROR] ${err.code || "UNKNOWN"}: ${err.message}`);
  } else {
    console.error("Global Error Handler:", err.stack || err.message);
  }

  // MongoDB duplicate key error (e.g. race condition on unique index)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || null;
    return res.status(409).json({
      error: "Duplicate entry",
      code: "DUPLICATE_KEY",
      field,
    });
  }

  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    code: err.code || "INTERNAL_SERVER_ERROR",
  });
};
