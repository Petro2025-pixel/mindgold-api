import mongoose from "mongoose";

/**
 * Embedded schema for an individual quiz question.
 */
const QuestionSchema = new mongoose.Schema(
  {
    id: { type: String, trim: true },
    question: { type: String, required: true, trim: true },
    answers: [{ type: String, trim: true }],
    correct: { type: Number, required: true, min: 0 },
    hint: { type: String, trim: true },
  },
  { _id: false },
);

/**
 * Mongoose schema definition for Quiz entity.
 */
const QuizSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    quizTitle: { type: String, required: true, trim: true },
    questions: [QuestionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

/**
 * Index for querying quizzes created by a specific user.
 */
QuizSchema.index({ createdBy: 1 });

/**
 * Quiz Mongoose Model.
 */
export const Quiz = mongoose.model("Quiz", QuizSchema);
