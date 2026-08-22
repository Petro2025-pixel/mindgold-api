import dotenv from "dotenv";
dotenv.config();

const requiredEnv = ["MONGO_URI"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
}
export const env = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI,
};
