import mongoose from "mongoose";

/**
 * Mongoose schema definition for Score entity (game results history).
 *
 * `playerId` is optional — game supports anonymous players (name only).
 * When auth is added, `playerId` will be linked to the User doc.
 */
const ScoreSchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // optional — anonymous players allowed
    },
    playerName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
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
  },
  {
    timestamps: true,
  },
);

/**
 * Indexes for leaderboards and player history.
 */
ScoreSchema.index({ quizId: 1, score: -1 }); // leaderboard per quiz
ScoreSchema.index({ playerName: 1, createdAt: -1 }); // player history
ScoreSchema.index({ createdAt: -1 }); // latest results

/**
 * Score Mongoose Model.
 */
export const Score = mongoose.model("Score", ScoreSchema);
