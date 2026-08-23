import mongoose from "mongoose";

/**
 * Mongoose schema definition for active game sessions.
 */
const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    currentIndex: {
      type: Number,
      default: 0,
      min: 0,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    wrongCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    wrongIds: [{ type: String }],
    lifelines: {
      fiftyFifty: { type: Boolean, default: false },
      skipQuestion: { type: Boolean, default: false },
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

/**
 * Indexes for querying user's active session and game state.
 */
SessionSchema.index({ userId: 1 });
SessionSchema.index({ userId: 1, quizId: 1 });

/**
 * Session Mongoose Model.
 */
export const Session = mongoose.model("Session", SessionSchema);