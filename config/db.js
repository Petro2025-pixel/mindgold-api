import mongoose from "mongoose";
import { env } from "./env.js";

const connectDB = async () => {
  const MONGO_URI = env.mongoUri;
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB (Docker)");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
