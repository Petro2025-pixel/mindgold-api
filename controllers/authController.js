import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";

/**
 * Register a new user.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<import('express').Response|void>}
 */
export const register = async (req, res, next) => {
  try {
    const { name, password, role } = req.body;
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User already exists", code: "USER_EXISTS" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      password: hashedPassword,
      role: role || "user",
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      env.jwtSecret || "secret_key",
      { expiresIn: "7d" },
    );
    return res.status(201).json({
      message: "User registered successfully",
      user: { _id: user._id, name: user.name, role: user.role },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in an existing user.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<import('express').Response|void>}
 */
export const login = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const user = await User.findOne({ name });
    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid credentials", code: "INVALID_CREDENTIALS" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "Invalid credentials", code: "INVALID_CREDENTIALS" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      env.jwtSecret || "secret_key",
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Logged in successfully",
      user: { _id: user._id, name: user.name, role: user.role },
      token,
    });
  } catch (error) {
    next(error);
  }
};
