import type {
  Request,
  Response,
} from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

// ======================================================
// GENERATE JWT
// ======================================================

const generateToken = (
  userId: string,
  role: string
) => {
  const secret =
    process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not configured"
    );
  }

  return jwt.sign(
    {
      id: userId,
      role,
    },
    secret,
    {
      expiresIn: "7d",
    }
  );
};

// ======================================================
// REGISTER PATIENT
// ======================================================

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      fullName,
      email,
      password,
    } = req.body;

    // VALIDATION

    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Full name, email and password are required.",
      });
    }

    if (
      password.length < 6
    ) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    // CHECK EXISTING USER

    const existingUser =
      await User.findOne({
        email:
          normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "An account with this email already exists.",
      });
    }

    // HASH PASSWORD

    const salt =
      await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(
        password,
        salt
      );

    // IMPORTANT:
    // Public registration creates patient only.
    // Frontend role input is intentionally ignored.

    const user =
      await User.create({
        fullName:
          fullName.trim(),

        email:
          normalizedEmail,

        password:
          hashedPassword,

        role:
          "patient",
      });

    return res.status(201).json({
      message:
        "Patient account created successfully.",

      user: {
        _id:
          user._id,

        fullName:
          user.fullName,

        email:
          user.email,

        role:
          user.role,
      },
    });
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to create account.",
    });
  }
};

// ======================================================
// LOGIN
// ======================================================

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // VALIDATION

    if (
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    // FIND USER

    const user =
      await User.findOne({
        email:
          normalizedEmail,
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    // CHECK PASSWORD

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    // GENERATE TOKEN

    const token =
      generateToken(
        user._id.toString(),
        user.role
      );

    return res.status(200).json({
      message:
        "Login successful.",

      token,

      user: {
        _id:
          user._id,

        fullName:
          user.fullName,

        email:
          user.email,

        role:
          user.role,
      },
    });
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to login.",
    });
  }
};

// ======================================================
// GET DOCTORS
// ======================================================

export const getDoctors = async (
  req: Request,
  res: Response
) => {
  try {
    const doctors =
      await User.find({
        role: "doctor",
      })
        .select(
          "_id fullName email role specialization"
        )
        .sort({
          fullName: 1,
        });

    return res.status(200).json({
      doctors,
    });
  } catch (error) {
    console.error(
      "GET DOCTORS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load doctors.",
    });
  }
};