/**
 * JSON Schema for user registration validation.
 * @type {import('ajv').JSONSchemaType}
 */
export const registerSchema = {
  type: "object",
  required: ["name", "password"],
  properties: {
    name: {
      type: "string",
      minLength: 2,
      maxLength: 30,
    },
    password: {
      type: "string",
      minLength: 6,
      maxLength: 72,
    },
  },
  additionalProperties: false,
};

/**
 * JSON Schema for user login validation.
 */
export const loginSchema = {
  type: "object",
  required: ["name", "password"],
  properties: {
    name: {
      type: "string",
      minLength: 1,
      maxLength: 30,
    },
    password: {
      type: "string",
      minLength: 1,
      maxLength: 72,
    },
  },
  additionalProperties: false,
};
