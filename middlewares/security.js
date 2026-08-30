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
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000",
    ];

    // Allow requests with no origin (like mobile apps, curl, or Postman)
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
 * Rate limiting configuration for API routes.
 * Limits each IP to 100 requests per 15-minute window to prevent DDoS and brute-force attacks.
 *
 * @type {import('express-rate-limit').Options}
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
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
 * Applied protections:
 * - Helmet: Sets secure HTTP headers to prevent XSS and clickjacking.
 * - Express Rate Limit: Throttles excessive API requests.
 * - Mongo Sanitize: Removes untrusted `$` and `.` operators to prevent NoSQL injection attacks.
 *
 * @param {import('express').Application} app - The Express application instance.
 * @returns {void}
 */
export const setupSecurity = (app) => {
app.use(cors(corsOptions));

  // Secure HTTP headers
  app.use(helmet());

  // Rate-limiting for all API endpoints
  app.use(apiLimiter);

  // Custom NoSQL Sanitizer for req.body
  app.use(sanitizeBody);
};
