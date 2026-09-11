import { Quiz } from "../models/Quiz.js";

/**
 * Returns all quizzes with metadata only (no correct answers, to avoid leaking them to players).
 */
export const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find().select(
      "slug quizTitle questions.question createdAt",
    );
    res.json({ quizzes });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns a single quiz by slug, with correct answers stripped from each question
 * (safe to expose to a player currently taking the quiz).
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

export const createQuiz = async (req, res, next) => {
  try {
    const { quizTitle, questions } = req.body;
    const slug = quizTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const quiz = await Quiz.create({
      slug,
      quizTitle,
      questions,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (error) {
    next(error);
  }
};

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
 * Checks whether a given answer index is correct for a specific question,
 * without ever exposing the correct answer index itself in the response.
 */
export const checkAnswer = async (req, res, next) => {
  try {
    const { slug, questionId } = req.params;
    const { answerIndex } = req.body;

    if (typeof answerIndex !== "number") {
      return res.status(400).json({
        error: "answerIndex must be a number",
        code: "VALIDATION_ERROR",
      });
    }

    const quiz = await Quiz.findOne({ slug });
    if (!quiz) {
      return res
        .status(404)
        .json({ error: "Quiz not found", code: "NOT_FOUND" });
    }

    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question) {
      return res
        .status(404)
        .json({ error: "Question not found", code: "NOT_FOUND" });
    }

    const isCorrect = answerIndex === question.correct;
    res.json({ correct: isCorrect });
  } catch (error) {
    next(error);
  }
};
