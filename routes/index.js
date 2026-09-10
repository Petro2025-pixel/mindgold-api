import { Router } from "express";
import authRouter from "./authRouter.js";
import quizRoutes from "./quizzes.js";
import gameRoutes from "./game.js";

/**
 * Main API Express router aggregating all domain-specific sub-routers.
 *
 * Mount points:
 * - `/auth` -> Authentication & Authorization routes (login, register, token refresh)
 * - `/quizzes` -> Quiz management routes (CRUD operations, schemas)
 * - `/game` -> Interactive gameplay routes (sessions, score calculations, leaderboards)
 *
 * @type {import('express').Router}
 */
const router = Router();

// Mount domain-specific route modules
router.use("/users", authRouter);
router.use("/quizzes", quizRoutes);
// router.use("/game", gameRoutes);

export default router;
