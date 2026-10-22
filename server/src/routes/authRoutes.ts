import express from "express";

import {
  register,
  login,
  getDoctors,
} from "../controllers/authController.js";

const router = express.Router();

// ======================================================
// AUTH ROUTES
// ======================================================

// Patient Registration
// POST /api/auth/register
router.post(
  "/register",
  register
);

// Login for Patient / Doctor / Admin
// POST /api/auth/login
router.post(
  "/login",
  login
);

// Public doctor list
// Used by patient appointment booking page
// GET /api/auth/doctors
router.get(
  "/doctors",
  getDoctors
);

export default router;