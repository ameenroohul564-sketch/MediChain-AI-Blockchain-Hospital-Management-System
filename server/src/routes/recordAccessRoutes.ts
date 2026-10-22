import {
  Router,
} from "express";

import {
  protect,
  patientOnly,
  doctorOnly,
} from "../middleware/authMiddleware.js";

import {
  getMyConsents,
  grantDoctorConsent,
  revokeDoctorConsent,
  getMyAccessLogs,
  doctorOpenMedicalRecord,
} from "../controllers/recordAccessController.js";

const router =
  Router();

// ======================================================
// PATIENT CONSENT SETTINGS
// ======================================================

router.get(
  "/consents",
  protect,
  patientOnly,
  getMyConsents
);

router.post(
  "/consents",
  protect,
  patientOnly,
  grantDoctorConsent
);

router.patch(
  "/consents/:doctorId/revoke",
  protect,
  patientOnly,
  revokeDoctorConsent
);

// ======================================================
// PATIENT ACCESS HISTORY
// ======================================================

router.get(
  "/logs",
  protect,
  patientOnly,
  getMyAccessLogs
);

// ======================================================
// DOCTOR OPEN RECORD
// CONSENT CHECK + ACCESS LOG
// ======================================================

router.get(
  "/records/:recordId",
  protect,
  doctorOnly,
  doctorOpenMedicalRecord
);

export default router;