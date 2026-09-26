/**
 * AJV schema for creating a new quiz.
 * Validates incoming POST /api/v1/quizzes request body.
 *
 * Required fields: quizTitle, questions, category.
 * Each question must have: question, answers (2–4), correct (index 0–3).
 *
 * @type {object}
 */
export const quizSchema = {
  type: "object",
  required: ["quizTitle", "questions", "category"],
  properties: {
    quizTitle: {
      type: "string",
      minLength: 1,
    },
    category: {
      type: "string",
      minLength: 1,
    },
    tags: {
      type: "array",
      items: { type: "string", minLength: 1 },
    },
    questions: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["question", "answers", "correct"],
        properties: {
          id: { type: "string" },
          question: { type: "string", minLength: 2 },
          answers: {
            type: "array",
            minItems: 2,
            maxItems: 4,
            items: { type: "string", minLength: 1 },
          },
          correct: {
            type: "integer",
            minimum: 0,
            maximum: 3,
          },
          hint: { type: "string" },
        },
      },
    },
  },
  additionalProperties: false,
};

/**
 * AJV schema for checking a single quiz answer.
 * Validates incoming POST /api/v1/quizzes/:slug/questions/:questionId/check request body.
 *
 * @type {object}
 */
export const checkAnswerSchema = {
  type: "object",
  required: ["answerText"],
  properties: {
    answerText: {
      type: "string",
      minLength: 1,
      maxLength: 500,
    },
  },
  additionalProperties: false,
};
