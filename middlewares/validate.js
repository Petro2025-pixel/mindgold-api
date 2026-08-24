import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

/**
 * Express middleware factory for validating request body against a JSON schema.
 * @param {object} schema - The JSON Schema object used for validation.
 * @returns {import('express').RequestHandler} Express middleware function to validate req.body.
 */

export const validate = (schema) => {
  const validateFn = ajv.compile(schema);

  /**
   * Express RequestHandler.
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   * @param {import('express').NextFunction} next - Express next middleware function.
   * @returns {void|import('express').Response}
   */
  return (req, res, next) => {
    const valid = validateFn(req.body);

    if (valid) {
      return next();
    }

    const errors = validateFn.errors.map((err) => ({
      field: err.instancePath.replace("/", "") || err.params.missingProperty,
      message: err.message,
    }));

    return res.status(400).json({
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: errors,
    });
  };
};
