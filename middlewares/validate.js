import Ajv from "ajv";
import addFormats from "ajv-formats"; 

/**
 * Shared Ajv instance initialized with option to collect all validation errors.
 */
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

/**
 * Express middleware factory for validating request bodies against JSON schemas.
 * Compiles the schema once during initialization to optimize runtime performance.
 *
 * @param {object} schema - Plain JSON Schema object to compile and validate against.
 * @returns {import('express').RequestHandler} Express middleware function.
 */
export const validate = (schema) => {
  // 1. Compile schema ONCE when the route is defined/loaded
  const validateFn = ajv.compile(schema);

  /**
   * Express RequestHandler executing compiled schema validation.
   *
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @param {import('express').NextFunction} next - The next middleware function.
   * @returns {void|import('express').Response}
   */
  return (req, res, next) => {
    const isValid = validateFn(req.body);

    if (!isValid) {
      const errors = validateFn.errors.map((err) => {
        // Clean leading slash and format nested field paths (e.g., questions.0.title)
        const fieldPath = err.instancePath
          ? err.instancePath.replace(/^\//, "").replace(/\//g, ".")
          : err.params?.missingProperty || "root";

        return {
          field: fieldPath,
          message: err.message,
        };
      });

      return res.status(400).json({
        error: "Validation error",
        code: "VALIDATION_ERROR",
        details: errors,
      });
    }

    next();
  };
};