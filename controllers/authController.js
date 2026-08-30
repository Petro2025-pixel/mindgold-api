import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";

/**
 * Registers a new user account.
 * Note: Password hashing is automatically handled by the User model pre-save hook.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
export const register = async (req, res, next) => {
  try {
    const { name, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(409).json({
        error: "User with this name already exists",
        code: "USER_EXISTS",
      });
    }

    // Pass raw password — pre("save") hook in User.js handles bcrypt hashing
    const user = await User.create({
      name,
      passwordHash: password,
      role: "player",
    });

    // Issue JWT token (using validated env.jwtSecret without dead fallback)
    const token = jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticates an existing user and returns a JWT token.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
export const login = async (req, res, next) => {
  try {
    const { name, password } = req.body;

    // 1. Find user by name
    const user = await User.findOne({ name }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // 2. Compare candidate password with stored hash via model instance method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // 3. Issue JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
