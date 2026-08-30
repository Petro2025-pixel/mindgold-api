import app from "./app.js";
import connectDB from "./config/db.js";
import { env } from "./config/env.js";

const PORT = env.port

/**
 * Initializes database connection and boots up the HTTP server.
 *
 * @async
 * @returns {Promise<void>}
 */
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Server running in ${env.nodeEnv || "development"} mode on port ${PORT}`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
