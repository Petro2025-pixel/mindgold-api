import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

/**
 * CORS configuration allowing requests from designated production and local origins.
 * @type {import('cors').CorsOptions}
 */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://mindgold.top",
      "https://www.mindgold.top",
      "http://localhost:5173",
      "http://localhost:3000",
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy error: Origin not allowed"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

/**
 * Rate limiting for general API routes.
 * Skips the /health endpoint — that one is polled frequently by clients
 * and shouldn't consume the shared request budget.
 *
 * @type {import('express-rate-limit').Options}
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/api/v1/health", // ← НОВОЕ
  message: { error: "Too many requests from this IP, please try again later." },
});

/**
 * Custom middleware to sanitize req.body against NoSQL injection (Express 5 compatible).
 * Removes keys starting with '$' or containing '.' from JSON bodies.
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    const clean = (obj) => {
      for (const key in obj) {
        if (key.startsWith("$") || key.includes(".")) {
          delete obj[key];
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          clean(obj[key]);
        }
      }
    };
    clean(req.body);
  }
  next();
};

/**
 * Configures global security middlewares for the Express application.
 *
 * @param {import('express').Application} app
 * @returns {void}
 */
export const setupSecurity = (app) => {
  app.use(cors(corsOptions));
  app.use(helmet());
  app.use(apiLimiter);
  app.use(sanitizeBody);
};
