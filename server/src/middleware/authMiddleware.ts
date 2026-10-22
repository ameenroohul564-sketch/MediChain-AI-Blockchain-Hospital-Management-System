import type {
  NextFunction,
  Request,
  Response,
} from "express";

import jwt from "jsonwebtoken";

import User from "../models/User.js";

// ======================================================
// TYPES
// ======================================================

export type AuthRole =
  | "patient"
  | "doctor"
  | "admin";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: AuthRole;
}

export interface AuthRequest
  extends Request {
  user?: AuthUser;
}

interface JwtPayloadData
  extends jwt.JwtPayload {
  id?: string;
  userId?: string;
  _id?: string;
  role?: AuthRole;
}

// ======================================================
// PROTECT ROUTE
// ======================================================

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization =
      req.headers.authorization;

    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        message:
          "Authentication required.",
      });
    }

    const token =
      authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message:
          "Authentication token missing.",
      });
    }

    const secret =
      process.env.JWT_SECRET;

    if (!secret) {
      console.error(
        "JWT_SECRET is missing."
      );

      return res.status(500).json({
        message:
          "Server authentication configuration error.",
      });
    }

    const decoded =
      jwt.verify(
        token,
        secret
      ) as JwtPayloadData;

    // Supports old and new token formats
    const userId =
      decoded.id ||
      decoded.userId ||
      decoded._id ||
      decoded.sub;

    if (!userId) {
      return res.status(401).json({
        message:
          "Invalid authentication token.",
      });
    }

    // IMPORTANT:
    // Always get latest role from database
    const user =
      await User.findById(
        userId
      ).select(
        "_id fullName email role"
      );

    if (!user) {
      return res.status(401).json({
        message:
          "User account not found.",
      });
    }

    req.user = {
      id: user._id.toString(),

      fullName:
        user.fullName,

      email:
        user.email,

      role:
        user.role,
    };

    next();
  } catch (error: any) {
    console.error(
      "AUTH MIDDLEWARE ERROR:",
      error
    );

    if (
      error?.name ===
        "JsonWebTokenError" ||
      error?.name ===
        "TokenExpiredError"
    ) {
      return res.status(401).json({
        message:
          "Invalid or expired authentication token.",
      });
    }

    return res.status(500).json({
      message:
        "Authentication failed.",
    });
  }
};

// ======================================================
// PATIENT ONLY
// ======================================================

export const patientOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      message:
        "Authentication required.",
    });
  }

  if (
    req.user.role !==
    "patient"
  ) {
    return res.status(403).json({
      message:
        "Only patients can access this feature.",
    });
  }

  next();
};

// ======================================================
// DOCTOR ONLY
// ======================================================

export const doctorOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      message:
        "Authentication required.",
    });
  }

  if (
    req.user.role !==
    "doctor"
  ) {
    return res.status(403).json({
      message:
        "Only doctors can access this feature.",
    });
  }

  next();
};

// ======================================================
// ADMIN ONLY
// ======================================================

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      message:
        "Authentication required.",
    });
  }

  if (
    req.user.role !==
    "admin"
  ) {
    console.log(
      "ADMIN ACCESS DENIED:",
      {
        id: req.user.id,
        email:
          req.user.email,
        role:
          req.user.role,
      }
    );

    return res.status(403).json({
      message:
        "Only administrators can access this feature.",
    });
  }

  next();
};