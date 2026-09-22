import { Quiz } from "../models/Quiz.js";

/**
 * Returns all quizzes with metadata only.
 * Supports optional filtering by category and tags.
 *
 * GET /api/v1/quizzes?category=austria&tags=b1,integration
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const getQuizzes = async (req, res, next) => {
  try {
    const { category, tags } = req.query;

    const filter = {};

    if (category) {
      filter.category = String(category).toLowerCase().trim();
    }

    if (tags) {
      const tagArray = String(tags)
        .split(",")
        .map((t) => t.toLowerCase().trim())
        .filter(Boolean);

      if (tagArray.length > 0) {
        filter.tags = { $all: tagArray }; // match ALL provided tags
      }
    }

    const quizzes = await Quiz.find(filter).select(
      "slug quizTitle category tags questions.question createdAt",
    );

    res.json({ quizzes });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns a single quiz by slug, with correct answers stripped.
 *
 * GET /api/v1/quizzes/:slug
 */
export const getQuizBySlug = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ slug: req.params.slug });
    if (!quiz) {
      return res
        .status(404)
        .json({ error: "Quiz not found", code: "NOT_FOUND" });
    }

    const safeQuiz = {
      slug: quiz.slug,
      quizTitle: quiz.quizTitle,
      category: quiz.category,
      tags: quiz.tags,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        question: q.question,
        answers: q.answers,
        hint: q.hint,
        // correct is intentionally omitted here
      })),
    };

    res.json({ quiz: safeQuiz });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns distinct categories with quiz counts.
 * Used by CategoryList page.
 *
 * GET /api/v1/categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Quiz.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 0 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      categories: categories.map((c) => ({
        slug: c._id,
        count: c.count,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns distinct tags across all quizzes.
 * Used by tag filter UI.
 *
 * GET /api/v1/tags
 */
export const getTags = async (req, res, next) => {
  try {
    const tags = await Quiz.distinct("tags");
    res.json({
      tags: tags.filter(Boolean).sort(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new quiz (admin only).
 *
 * POST /api/v1/quizzes
 */
export const createQuiz = async (req, res, next) => {
  try {
    const { quizTitle, questions, category = "other", tags = [] } = req.body;

    const slug = quizTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const quiz = await Quiz.create({
      slug,
      quizTitle,
      category,
      tags,
      questions,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a quiz by ID (admin only).
 *
 * DELETE /api/v1/quizzes/:id
 */
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res
        .status(404)
        .json({ error: "Quiz not found", code: "NOT_FOUND" });
    }
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * Checks an answer for a given question.
 *
 * POST /api/v1/quizzes/:slug/questions/:questionId/check
 */
export const checkAnswer = async (req, res, next) => {
  try {
    const { slug, questionId } = req.params;
    const { answerText } = req.body;

    const quiz = await Quiz.findOne({ slug });
    if (!quiz) {
      return res
        .status(404)
        .json({ error: "Quiz not found", code: "NOT_FOUND" });
    }

    const question = quiz.questions.find(
      (q) => q._id?.toString() === questionId || q.id === questionId,
    );

    if (!question) {
      return res
        .status(404)
        .json({ error: "Question not found", code: "NOT_FOUND" });
    }

    const correctOptionText = question.answers[question.correct];
    const isCorrect = answerText === correctOptionText;

    return res.json({ correct: isCorrect });
  } catch (error) {
    next(error);
  }
};
