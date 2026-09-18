import { Router } from "express";
import {
  saveScore,
  getGlobalLeaderboard,
  getQuizLeaderboard,
  getPlayerHistory,
} from "../controllers/scoreController.js";
import { validate } from "../middlewares/validate.js";
import { saveScoreSchema } from "../schemas/scoreSchema.js";

/**
 * Express router for score/leaderboard endpoints.
 * @type {import('express').Router}
 */
const router = Router();

/**
 * @route   POST /api/v1/scores
 * @desc    Save a game result
 * @access  Public
 */
router.post("/", validate(saveScoreSchema), saveScore);

/**
 * @route   GET /api/v1/scores/leaderboard
 * @desc    Global leaderboard (top players)
 * @access  Public
 */
router.get("/leaderboard", getGlobalLeaderboard);

/**
 * @route   GET /api/v1/scores/leaderboard/:slug
 * @desc    Leaderboard for a specific quiz
 * @access  Public
 */
router.get("/leaderboard/:slug", getQuizLeaderboard);

/**
 * @route   GET /api/v1/scores/player/:name
 * @desc    Score history for a specific player
 * @access  Public
 */
router.get("/player/:name", getPlayerHistory);

export default router;
