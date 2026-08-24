export const quizSchema = {
  type: "object",
  required: ["quizTitle", "questions"],
  properties: {
    quizTitle: {
      type: "string",
      minLength: 1,
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
