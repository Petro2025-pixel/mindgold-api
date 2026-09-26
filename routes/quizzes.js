import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware.js";
import { createQuizLimiter } from "../middlewares/createQuizLimiter.js";
import {
  getQuizzes,
  getQuizBySlug,
  createQuiz,
  deleteQuiz,
  checkAnswer,
} from "../controllers/quizController.js";
import { validate } from "../middlewares/validate.js";
import { quizSchema, checkAnswerSchema } from "../schemas/quizSchema.js";

/**
 * Express router for quiz-related endpoints.
 * Handles public quiz retrieval and admin-only quiz management.
 *
 * @type {import('express').Router}
 */
const router = Router();

/**
 * @route   GET /api/v1/quizzes
 * @desc    Retrieve all quizzes (metadata only, with optional filters)
 * @access  Public
 */
router.get("/", getQuizzes);

/**
 * @route   GET /api/v1/quizzes/:slug
 * @desc    Retrieve a single quiz by slug (correct answers stripped)
 * @access  Public
 */
router.get("/:slug", getQuizBySlug);

/**
 * @route   POST /api/v1/quizzes/:slug/questions/:questionId/check
 * @desc    Check whether a submitted answer is correct
 * @access  Public
 */
router.post(
  "/:slug/questions/:questionId/check",
  validate(checkAnswerSchema),
  checkAnswer,
);

/**
 * @route   POST /api/v1/quizzes
 * @desc    Create a new quiz (admin only, rate-limited to 3/day in test mode)
 * @access  Private (Admin)
 *
 * Middleware order:
 *   1. authenticate       — verify JWT, populate req.user
 *   2. requireAdmin       — ensure req.user.role === "admin"
 *   3. createQuizLimiter  — enforce 3 quizzes/day per user
 *   4. validate           — AJV validation against quizSchema
 *   5. createQuiz         — persist to MongoDB
 */
router.post(
  "/",
  authenticate,
  requireAdmin,
  createQuizLimiter,
  validate(quizSchema),
  createQuiz,
);

/**
 * @route   DELETE /api/v1/quizzes/:id
 * @desc    Delete an existing quiz by ID (admin only)
 * @access  Private (Admin)
 */
router.delete("/:id", authenticate, requireAdmin, deleteQuiz);

export default router;
