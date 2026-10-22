import {
  Router,
} from "express";

import {
  createMedicalRecord,
  getMedicalRecords,
  verifyMedicalRecord,
  updateMedicalRecord,
  getMedicalRecordHistory,
} from "../controllers/medicalRecordController.js";

import {
  protect,
  doctorOnly,
} from "../middleware/authMiddleware.js";

const router = Router();

// ======================================================
// GET RECORDS
//
// Patient -> own records
// Doctor  -> records created by that doctor
// Admin   -> all records
// ======================================================

router.get(
  "/",
  protect,
  getMedicalRecords
);

// ======================================================
// CREATE RECORD
// Doctor only
// ======================================================

router.post(
  "/",
  protect,
  doctorOnly,
  createMedicalRecord
);

// ======================================================
// VERIFY RECORD
//
// IMPORTANT:
// Frontend calls:
// GET /api/medical-records/:id/verify
// ======================================================

router.get(
  "/:id/verify",
  protect,
  verifyMedicalRecord
);

// ======================================================
// BLOCKCHAIN / AUDIT HISTORY
// ======================================================

router.get(
  "/:id/history",
  protect,
  getMedicalRecordHistory
);

// ======================================================
// UPDATE RECORD
// New blockchain version
// ======================================================

router.patch(
  "/:id",
  protect,
  doctorOnly,
  updateMedicalRecord
);

export default router;