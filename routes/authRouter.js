import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../schemas/userSchema.js";

/**
 * Express router for authentication endpoints.
 * @type {import('express').Router}
 */
const authRouter = Router();

// POST /api/v1/users/register ( /api/v1/register)
authRouter.post("/register", validate(registerSchema), register);

// POST /api/v1/users/login (/api/v1/login)
authRouter.post("/login", validate(loginSchema), login);

export default authRouter;