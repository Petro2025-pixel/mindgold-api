import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { env } from "./config/env.js";

const PORT = env.port;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};
startServer();
