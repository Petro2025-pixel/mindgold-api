import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const username = process.argv[2];
if (!username) {
  console.error("Usage: node scripts/promoteAdmin.js <username>");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
const user = await User.findOneAndUpdate(
  { name: username },
  { role: "admin" },
  { new: true },
);

if (!user) {
  console.error(`User "${username}" not found.`);
} else {
  console.log(`User "${user.name}" is now an admin.`);
}
process.exit(0);
