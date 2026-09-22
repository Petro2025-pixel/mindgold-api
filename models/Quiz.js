import mongoose from "mongoose";

/**
 * Embedded schema for an individual quiz question.
 */
const QuestionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
    },
    question: { type: String, required: true, trim: true },
    answers: [{ type: String, trim: true }],
    correct: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
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
    category: {
      type: String,
      lowercase: true,
      trim: true,
      default: "other",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
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
