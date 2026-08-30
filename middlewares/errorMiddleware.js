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
    code: 'NOT_FOUND'
  });
};

/**
 * Global error handling middleware for Express.
 * Catches all errors passed via next(error) and formats response.
 *
 * @param {Error & { status?: number, statusCode?: number, code?: string }} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const errorHandler = (err, req, res, next) => {
  console.error("Global Error Handler:", err.stack || err.message);

  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    code: err.code || "INTERNAL_SERVER_ERROR",
  });
};