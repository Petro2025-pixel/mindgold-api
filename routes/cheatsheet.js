import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getCheatSheet } from "../controllers/quizController.js";

/**
 * Express router for CheatSheet study endpoints.
 *
 * Exposes quiz content WITH correct answers and hints.
 * Unlike `/quizzes/:slug`, this route is meant for study, not play.
 *
 * @type {import('express').Router}
 */
const router = Router();

/**
 * @route   GET /api/v1/cheatsheet/:slug
 * @desc    Get a single quiz with correct answers + hints (for study)
 * @access  Private (any authenticated user)
 */
router.get("/:slug", authenticate, getCheatSheet);

export default router;
