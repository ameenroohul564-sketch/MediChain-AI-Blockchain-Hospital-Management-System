import {
  Router,
} from "express";

import {
  bookAppointment,
  getAppointments,
  cancelAppointment,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";

import {
  protect,
  patientOnly,
  doctorOnly,
} from "../middleware/authMiddleware.js";

const router =
  Router();

// ======================================================
// BOOK APPOINTMENT
// PATIENT ONLY
// ======================================================

router.post(
  "/",
  protect,
  patientOnly,
  bookAppointment
);

// ======================================================
// GET APPOINTMENTS
// PATIENT / DOCTOR / ADMIN
// ======================================================

router.get(
  "/",
  protect,
  getAppointments
);

// ======================================================
// PATIENT CANCEL APPOINTMENT
// ======================================================

router.patch(
  "/:id/cancel",
  protect,
  patientOnly,
  cancelAppointment
);

// ======================================================
// DOCTOR UPDATE APPOINTMENT STATUS
// ======================================================

router.patch(
  "/:id/status",
  protect,
  doctorOnly,
  updateAppointmentStatus
);

export default router;