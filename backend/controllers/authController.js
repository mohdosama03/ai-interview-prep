import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });


export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, role, experienceLevel } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "Frontend Developer",
      experienceLevel: experienceLevel || "Fresher",
    });

    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(user._id);
    res.json({ success: true, token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};
