import mongoose from "mongoose";

/**
 * Mongoose schema definition for Score entity (game results history).
 */
const ScoreSchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    playerName: {
      type: String,
      required: true,
      trim: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    quizTitle: {
      type: String,
      trim: true,
    },
    quizFile: {
      type: String,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 1,
    },
    wrongIds: [{ type: String }],
    date: {
      type: String,
      default: () => new Date().toLocaleDateString("en-GB"),
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Indexes for history queries, quiz leaderboards, and user stats.
 */
ScoreSchema.index({ playerId: 1 });
ScoreSchema.index({ quizId: 1 });
ScoreSchema.index({ score: -1 });
ScoreSchema.index({ playerId: 1, quizId: 1 });

/**
 * Score Mongoose Model.
 */
export const Score = mongoose.model("Score", ScoreSchema);
