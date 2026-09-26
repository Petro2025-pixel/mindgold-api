import rateLimit from "express-rate-limit";

/**
 * Rate limiter for the quiz creation endpoint (POST /api/v1/quizzes).
 *
 * Limits each authenticated user to a maximum of 3 quiz creations
 * per 24-hour window during the test phase.
 *
 * IMPORTANT: Must be mounted AFTER the `authenticate` middleware,
 * because the rate limit key is derived from `req.user.id`.
 *
 * On limit exceeded, responds with HTTP 429 and:
 *   - `error`: human-readable message
 *   - `code`: "QUIZ_LIMIT_REACHED" (used by the frontend to show a modal)
 *   - `retryAfter`: seconds until the limit resets
 *
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 */
export const createQuizLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 quizzes per day per user

  /**
   * Use the authenticated user's ID as the rate limit key.
   * Since this limiter is mounted AFTER `authenticate`,
   * `req.user.id` is guaranteed to be present.
   *
   * @param {import('express').Request} req
   * @returns {string}
   */
  keyGenerator: (req) => req.user.id,

  standardHeaders: true,
  legacyHeaders: false,

  /**
   * Custom handler returning structured JSON with `retryAfter` in seconds.
   * The frontend uses this to show "Try again in Xh Ym".
   */
  handler: (req, res, next, options) => {
    res.status(429).json({
      error: options.message.error,
      code: options.message.code,
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000),
    });
  },

  message: {
    error: "Test mode: max 3 quizzes per day.",
    code: "QUIZ_LIMIT_REACHED",
  },
});
