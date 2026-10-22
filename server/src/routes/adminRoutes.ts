import { Router } from "express";

import {
  getAllDoctors,
  createDoctor,
  deleteDoctor,
} from "../controllers/adminController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = Router();

// ======================================================
// GET ALL DOCTORS
// ======================================================

router.get(
  "/doctors",
  protect,
  adminOnly,
  getAllDoctors
);

// ======================================================
// CREATE DOCTOR
// ======================================================

router.post(
  "/doctors",
  protect,
  adminOnly,
  createDoctor
);

// ======================================================
// DELETE DOCTOR
// ======================================================

router.delete(
  "/doctors/:id",
  protect,
  adminOnly,
  deleteDoctor
);

export default router;