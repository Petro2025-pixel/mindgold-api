/**
 * JSON Schema for saving a score.
 * @type {import('ajv').JSONSchemaType}
 */
export const saveScoreSchema = {
  type: "object",
  required: ["playerName", "slug", "score", "total"],
  properties: {
    playerName: {
      type: "string",
      minLength: 1,
      maxLength: 50,
    },
    slug: {
      type: "string",
      minLength: 1,
    },
    score: {
      type: "integer",
      minimum: 0,
    },
    total: {
      type: "integer",
      minimum: 1,
    },
    wrongIds: {
      type: "array",
      items: { type: "string" },
      maxItems: 100,
    },
  },
  additionalProperties: false,
};
