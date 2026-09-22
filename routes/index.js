import { Router } from "express";
import authRouter from "./authRouter.js";
import quizRoutes from "./quizzes.js";
import scoreRoutes from "./scores.js";
import { getCategories, getTags } from "../controllers/quizController.js";

/**
 * Main API Express router aggregating all domain-specific sub-routers.
 *
 * Mount points:
 * - `/users`      → auth (register, login)
 * - `/quizzes`    → quiz management + answer check
 * - `/scores`     → score history + leaderboards
 * - `/categories` → list of quiz categories
 * - `/tags`       → list of unique tags
 *
 * @type {import('express').Router}
 */
const router = Router();

// ── Category & tag endpoints (must come BEFORE /quizzes sub-router) ──
router.get("/categories", getCategories);
router.get("/tags", getTags);

// ── Sub-routers ───────────────────────────────────────────────────────
router.use("/users", authRouter);
router.use("/quizzes", quizRoutes);
router.use("/scores", scoreRoutes);

export default router;
