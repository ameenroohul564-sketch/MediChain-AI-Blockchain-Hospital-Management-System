import type {
  Response,
} from "express";

import mongoose, {
  type FilterQuery,
} from "mongoose";

import Appointment, {
  type AppointmentPriority,
  type AppointmentStatus,
  type IAppointment,
  type SymptomProgress,
} from "../models/Appointment.js";

import User from "../models/User.js";

import type {
  AuthRequest,
} from "../middleware/authMiddleware.js";

// ======================================================
// BOOK APPOINTMENT
// PATIENT ONLY
// ======================================================

export const bookAppointment =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message:
            "Authentication required.",
        });
      }

      // ==================================================
      // BASIC APPOINTMENT DATA
      // ==================================================

      const doctorId =
        typeof req.body.doctor ===
        "string"
          ? req.body.doctor.trim()
          : "";

      const appointmentDateValue =
        typeof req.body
          .appointmentDate ===
        "string"
          ? req.body.appointmentDate
          : "";

      const reason =
        typeof req.body.reason ===
        "string"
          ? req.body.reason.trim()
          : "";

      if (
        !doctorId ||
        !appointmentDateValue ||
        !reason
      ) {
        return res.status(400).json({
          message:
            "Doctor, appointment date and reason are required.",
        });
      }

      // ==================================================
      // VALIDATE DOCTOR ID
      // ==================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          doctorId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid doctor ID.",
        });
      }

      // ==================================================
      // CHECK DOCTOR
      // ==================================================

      const doctor =
        await User.findById(
          doctorId
        );

      if (
        !doctor ||
        doctor.role !== "doctor"
      ) {
        return res.status(404).json({
          message:
            "Selected doctor was not found.",
        });
      }

      // ==================================================
      // VALIDATE DATE
      // ==================================================

      const appointmentDate =
        new Date(
          appointmentDateValue
        );

      if (
        Number.isNaN(
          appointmentDate.getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid appointment date.",
        });
      }

      if (
        appointmentDate.getTime() <=
        Date.now()
      ) {
        return res.status(400).json({
          message:
            "Appointment date must be in the future.",
        });
      }

      // ==================================================
      // AI PRE-CONSULTATION DATA
      // ==================================================

      const mainConcern =
        typeof req.body.mainConcern ===
        "string"
          ? req.body.mainConcern.trim()
          : "";

      const symptoms =
        Array.isArray(
          req.body.symptoms
        )
          ? req.body.symptoms
              .filter(
                (item: unknown) =>
                  typeof item ===
                  "string"
              )
              .map(
                (item: string) =>
                  item.trim()
              )
              .filter(Boolean)
          : [];

      const symptomDuration =
        typeof req.body
          .symptomDuration ===
        "string"
          ? req.body.symptomDuration.trim()
          : "";

      // ==================================================
      // SEVERITY
      // ==================================================

      const rawSeverity =
        Number(
          req.body.severity ??
            req.body.painLevel ??
            0
        );

      const severity =
        Number.isFinite(
          rawSeverity
        )
          ? Math.min(
              10,
              Math.max(
                0,
                rawSeverity
              )
            )
          : 0;

      const painLevel =
        severity;

      // ==================================================
      // ADDITIONAL SYMPTOMS
      // ==================================================

      const additionalSymptoms =
        Array.isArray(
          req.body
            .additionalSymptoms
        )
          ? req.body.additionalSymptoms
              .filter(
                (item: unknown) =>
                  typeof item ===
                  "string"
              )
              .map(
                (item: string) =>
                  item.trim()
              )
              .filter(Boolean)
          : symptoms;

      // ==================================================
      // PROGRESS
      // ==================================================

      const rawProgress =
        req.body.symptomProgress;

      const symptomProgress:
        SymptomProgress =
          rawProgress === "Better" ||
          rawProgress === "Worse" ||
          rawProgress === "No change"
            ? rawProgress
            : "No change";

      // ==================================================
      // HEALTH INFORMATION
      // ==================================================

      const existingConditions =
        typeof req.body
          .existingConditions ===
        "string"
          ? req.body.existingConditions.trim()
          : "";

      const currentMedications =
        typeof req.body
          .currentMedications ===
        "string"
          ? req.body.currentMedications.trim()
          : "";

      const allergies =
        typeof req.body.allergies ===
        "string"
          ? req.body.allergies.trim()
          : "";

      // ==================================================
      // EMERGENCY SYMPTOMS
      // ==================================================

      const emergencySymptoms =
        Array.isArray(
          req.body
            .emergencySymptoms
        )
          ? req.body.emergencySymptoms
              .filter(
                (item: unknown) =>
                  typeof item ===
                  "string"
              )
              .map(
                (item: string) =>
                  item.trim()
              )
              .filter(Boolean)
          : [];

      // Do not trust only frontend urgentCareRequired.
      // Recalculate from selected emergency symptoms.

      const urgentSymptoms =
        emergencySymptoms.filter(
          (item: string) =>
            item.toLowerCase() !==
            "none"
        );

      const urgentCareRequired =
        urgentSymptoms.length > 0;

      // ==================================================
      // PREVENT ROUTINE BOOKING FOR URGENT WARNING SIGNS
      // ==================================================

      if (
        urgentCareRequired
      ) {
        return res.status(400).json({
          message:
            "Urgent warning signs were reported. Please seek immediate professional medical care instead of waiting for a routine appointment.",
        });
      }

      // ==================================================
      // FOLLOW-UP ANSWERS
      // ==================================================

      const followUpAnswers =
        req.body
          .followUpAnswers &&
        typeof req.body
          .followUpAnswers ===
          "object" &&
        !Array.isArray(
          req.body.followUpAnswers
        )
          ? req.body.followUpAnswers
          : {};

      // ==================================================
      // AI SUMMARY
      // ==================================================

      const aiSummary =
        typeof req.body.aiSummary ===
        "string"
          ? req.body.aiSummary.trim()
          : "";

      const suggestedDepartment =
        typeof req.body
          .suggestedDepartment ===
        "string"
          ? req.body.suggestedDepartment.trim()
          : "General Medicine";

      const rawPriority =
        req.body.priority;

      const priority:
        AppointmentPriority =
          rawPriority === "Low" ||
          rawPriority === "Medium" ||
          rawPriority === "High"
            ? rawPriority
            : "Low";

      const aiAssessmentCompleted =
        Boolean(
          req.body
            .aiAssessmentCompleted
        );

      // ==================================================
      // CREATE APPOINTMENT
      // ==================================================

      const appointment =
        await Appointment.create({
          patient:
            new mongoose.Types.ObjectId(
              req.user.id
            ),

          doctor:
            new mongoose.Types.ObjectId(
              doctorId
            ),

          appointmentDate,

          reason,

          status:
            "Pending",

          // AI DATA

          mainConcern,

          symptoms,

          symptomDuration,

          painLevel,

          severity,

          additionalSymptoms,

          symptomProgress,

          existingConditions,

          currentMedications,

          allergies,

          emergencySymptoms,

          followUpAnswers,

          aiSummary,

          suggestedDepartment,

          priority,

          urgentCareRequired,

          aiAssessmentCompleted,
        });

      // ==================================================
      // POPULATE
      // ==================================================

      const populatedAppointment =
        await Appointment.findById(
          appointment._id
        )
          .populate(
            "patient",
            "fullName email role"
          )
          .populate(
            "doctor",
            "fullName email role specialization"
          );

      return res.status(201).json({
        message:
          "Appointment booked successfully.",

        appointment:
          populatedAppointment,
      });
    } catch (error) {
      console.error(
        "BOOK APPOINTMENT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to book appointment.",
      });
    }
  };

// ======================================================
// GET APPOINTMENTS
// PATIENT / DOCTOR / ADMIN
// ======================================================

export const getAppointments =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message:
            "Authentication required.",
        });
      }

      const query:
        FilterQuery<IAppointment> =
          {};

      // PATIENT

      if (
        req.user.role ===
        "patient"
      ) {
        query.patient =
          new mongoose.Types.ObjectId(
            req.user.id
          );
      }

      // DOCTOR

      if (
        req.user.role ===
        "doctor"
      ) {
        query.doctor =
          new mongoose.Types.ObjectId(
            req.user.id
          );
      }

      // ADMIN
      // No filter -> all appointments

      const appointments =
        await Appointment.find(
          query
        )
          .populate(
            "patient",
            "fullName email role"
          )
          .populate(
            "doctor",
            "fullName email role specialization"
          )
          .sort({
            appointmentDate: -1,
          });

      return res.status(200).json({
        appointments,
      });
    } catch (error) {
      console.error(
        "GET APPOINTMENTS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to load appointments.",
      });
    }
  };

// ======================================================
// PATIENT CANCEL APPOINTMENT
// ======================================================

export const cancelAppointment =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message:
            "Authentication required.",
        });
      }

      const appointmentId =
        String(
          req.params.id ?? ""
        );

      if (
        !mongoose.Types.ObjectId.isValid(
          appointmentId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid appointment ID.",
        });
      }

      const appointment =
        await Appointment.findById(
          appointmentId
        );

      if (!appointment) {
        return res.status(404).json({
          message:
            "Appointment not found.",
        });
      }

      if (
        appointment.patient.toString() !==
        req.user.id
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to cancel this appointment.",
        });
      }

      if (
        appointment.status ===
          "Completed" ||
        appointment.status ===
          "Cancelled"
      ) {
        return res.status(400).json({
          message:
            `A ${appointment.status.toLowerCase()} appointment cannot be cancelled.`,
        });
      }

      appointment.status =
        "Cancelled";

      await appointment.save();

      return res.status(200).json({
        message:
          "Appointment cancelled successfully.",

        appointment,
      });
    } catch (error) {
      console.error(
        "CANCEL APPOINTMENT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to cancel appointment.",
      });
    }
  };

// ======================================================
// DOCTOR UPDATE STATUS
// ======================================================

export const updateAppointmentStatus =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message:
            "Authentication required.",
        });
      }

      const appointmentId =
        String(
          req.params.id ?? ""
        );

      if (
        !mongoose.Types.ObjectId.isValid(
          appointmentId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid appointment ID.",
        });
      }

      const status =
        typeof req.body.status ===
        "string"
          ? req.body.status.trim()
          : "";

      const allowedStatuses:
        AppointmentStatus[] = [
          "Approved",
          "Completed",
          "Cancelled",
        ];

      if (
        !allowedStatuses.includes(
          status as AppointmentStatus
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid appointment status.",
        });
      }

      const appointment =
        await Appointment.findById(
          appointmentId
        );

      if (!appointment) {
        return res.status(404).json({
          message:
            "Appointment not found.",
        });
      }

      // ==================================================
      // DOCTOR OWNERSHIP
      // ==================================================

      if (
        appointment.doctor.toString() !==
        req.user.id
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to update this appointment.",
        });
      }

      // ==================================================
      // FINAL STATE PROTECTION
      // ==================================================

      if (
        appointment.status ===
          "Completed" ||
        appointment.status ===
          "Cancelled"
      ) {
        return res.status(400).json({
          message:
            `A ${appointment.status.toLowerCase()} appointment cannot be modified.`,
        });
      }

      // ==================================================
      // PENDING -> COMPLETED NOT ALLOWED
      // ==================================================

      if (
        appointment.status ===
          "Pending" &&
        status === "Completed"
      ) {
        return res.status(400).json({
          message:
            "Approve the appointment before marking it as completed.",
        });
      }

      appointment.status =
        status as AppointmentStatus;

      await appointment.save();

      const populatedAppointment =
        await Appointment.findById(
          appointment._id
        )
          .populate(
            "patient",
            "fullName email role"
          )
          .populate(
            "doctor",
            "fullName email role specialization"
          );

      return res.status(200).json({
        message:
          `Appointment marked as ${status}.`,

        appointment:
          populatedAppointment,
      });
    } catch (error) {
      console.error(
        "UPDATE APPOINTMENT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to update appointment.",
      });
    }
  };