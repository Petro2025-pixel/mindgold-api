import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware.js";
import {
  getQuizzes,
  getQuizBySlug,
  createQuiz,
  deleteQuiz,
  checkAnswer,
} from "../controllers/quizController.js";
import { Quiz } from "../models/Quiz.js";
import { validate } from "../middlewares/validate.js";
import { checkAnswerSchema } from "../schemas/quizSchema.js";

/**
 * Express router managing quiz endpoints and administrative access controls.
 * @type {import('express').Router}
 */
const router = Router();

/**
 * @route   GET /api/v1/quizzes
 * @desc    Retrieve all available quizzes (Public access)
 * @access  Public
 */
router.get("/", getQuizzes);

/**
 * @route   GET /api/v1/quizzes/categories
 * @desc    Get list of unique quiz categories
 * @access  Public
 */
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await Quiz.distinct("category");
    res.json(categories.filter(Boolean).sort());
  } catch (err) {
    next(err);
  }
});
router.get("/:slug", getQuizBySlug);

router.post(
  "/:slug/questions/:questionId/check",
  validate(checkAnswerSchema),
  checkAnswer,
);

/**
 * @route   POST /api/v1/quizzes
 * @desc    Create a new quiz
 * @access  Private (Admin only)
 */
router.post("/", authenticate, requireAdmin, createQuiz);

/**
 * @route   DELETE /api/v1/quizzes/:id
 * @desc    Delete an existing quiz by its unique ID
 * @access  Private (Admin only)
 */
router.delete("/:id", authenticate, requireAdmin, deleteQuiz);

export default router;
