import {
  Router,
} from "express";

import {
  assessSymptoms,
  getQuestionnaire,
} from "../controllers/aiController.js";

import {
  patientOnly,
  protect,
} from "../middleware/authMiddleware.js";

const router =
  Router();

// ======================================================
// GET QUESTIONNAIRE
// ======================================================

router.get(
  "/questions",
  protect,
  patientOnly,
  getQuestionnaire
);

// ======================================================
// RUN AI PRE-CONSULTATION
// ======================================================

router.post(
  "/assess",
  protect,
  patientOnly,
  assessSymptoms
);

export default router;