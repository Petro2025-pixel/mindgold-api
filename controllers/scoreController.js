import { Score } from "../models/Score.js";
import { Quiz } from "../models/Quiz.js";

/**
 * Save a new game result.
 *
 * POST /api/v1/scores
 * Body: { playerName, slug, score, total, wrongIds? }
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const saveScore = async (req, res, next) => {
  try {
    const { playerName, slug, score, total, wrongIds = [] } = req.body;

    // Find quiz by slug to get its _id and title
    const quiz = await Quiz.findOne({ slug }).select("_id quizTitle");
    if (!quiz) {
      return res.status(404).json({
        error: "Quiz not found",
        code: "QUIZ_NOT_FOUND",
      });
    }

    const savedScore = await Score.create({
      playerName: playerName.trim(),
      quizId: quiz._id,
      quizTitle: quiz.quizTitle,
      score,
      total,
      wrongIds,
      // playerId — omitted (anonymous play supported)
    });

    return res.status(201).json({
      message: "Score saved successfully",
      score: {
        id: savedScore._id,
        playerName: savedScore.playerName,
        quizTitle: savedScore.quizTitle,
        score: savedScore.score,
        total: savedScore.total,
        createdAt: savedScore.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get global leaderboard — top players across all quizzes.
 * Aggregates best score per player (by playerName).
 *
 * GET /api/v1/scores/leaderboard?limit=10
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const getGlobalLeaderboard = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);

    const leaderboard = await Score.aggregate([
      // Add percentage field
      {
        $addFields: {
          percentage: {
            $cond: [
              { $gt: ["$total", 0] },
              { $multiply: [{ $divide: ["$score", "$total"] }, 100] },
              0,
            ],
          },
        },
      },
      // Group by player — keep best score
      {
        $sort: { playerName: 1, percentage: -1, createdAt: 1 },
      },
      {
        $group: {
          _id: "$playerName",
          bestPercentage: { $first: "$percentage" },
          bestScore: { $first: "$score" },
          bestTotal: { $first: "$total" },
          gamesPlayed: { $sum: 1 },
          lastPlayed: { $max: "$createdAt" },
        },
      },
      // Sort by best percentage desc, then by lastPlayed desc
      {
        $sort: { bestPercentage: -1, lastPlayed: -1 },
      },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          playerName: "$_id",
          bestPercentage: { $round: ["$bestPercentage", 1] },
          bestScore: 1,
          bestTotal: 1,
          gamesPlayed: 1,
          lastPlayed: 1,
        },
      },
    ]);

    return res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
};

/**
 * Get leaderboard for a specific quiz.
 *
 * GET /api/v1/scores/leaderboard/:slug?limit=10
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const getQuizLeaderboard = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);

    const quiz = await Quiz.findOne({ slug: req.params.slug }).select("_id");
    if (!quiz) {
      return res.status(404).json({
        error: "Quiz not found",
        code: "QUIZ_NOT_FOUND",
      });
    }

    const leaderboard = await Score.aggregate([
      { $match: { quizId: quiz._id } },
      {
        $addFields: {
          percentage: {
            $cond: [
              { $gt: ["$total", 0] },
              { $multiply: [{ $divide: ["$score", "$total"] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { playerName: 1, percentage: -1, createdAt: 1 } },
      {
        $group: {
          _id: "$playerName",
          bestPercentage: { $first: "$percentage" },
          bestScore: { $first: "$score" },
          bestTotal: { $first: "$total" },
          attempts: { $sum: 1 },
          lastPlayed: { $max: "$createdAt" },
        },
      },
      { $sort: { bestPercentage: -1, lastPlayed: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          playerName: "$_id",
          bestPercentage: { $round: ["$bestPercentage", 1] },
          bestScore: 1,
          bestTotal: 1,
          attempts: 1,
          lastPlayed: 1,
        },
      },
    ]);

    return res.json({
      quiz: { slug: req.params.slug, quizTitle: quiz.quizTitle },
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get score history for a specific player.
 *
 * GET /api/v1/scores/player/:name?limit=20
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const getPlayerHistory = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const playerName = req.params.name.trim();

    const scores = await Score.find({ playerName })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("quizTitle score total wrongIds createdAt")
      .lean();

    const totalGames = await Score.countDocuments({ playerName });

    return res.json({
      playerName,
      totalGames,
      history: scores.map((s) => ({
        ...s,
        percentage:
          s.total > 0 ? Math.round((s.score / s.total) * 1000) / 10 : 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};
