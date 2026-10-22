import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import recordAccessRoutes from "./routes/recordAccessRoutes.js";
// ======================================================
// ENVIRONMENT
// ======================================================

dotenv.config();

// ======================================================
// APP
// ======================================================

const app = express();

const PORT =
  process.env.PORT || 5000;

// ======================================================
// MIDDLEWARE
// ======================================================

// Allow frontend requests
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    credentials: true,
  })
);

// IMPORTANT:
// Parse JSON request body
app.use(express.json());

// Parse form/urlencoded body
app.use(
  express.urlencoded({
    extended: true,
  })
);

// ======================================================
// REQUEST DEBUG
// ======================================================

app.use((req, _res, next) => {
  console.log(
    `${req.method} ${req.url}`
  );

  if (
    req.method === "POST" ||
    req.method === "PUT" ||
    req.method === "PATCH"
  ) {
    console.log(
      "REQUEST BODY:",
      req.body
    );
  }

  next();
});

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/", (_req, res) => {
  return res.status(200).json({
    message:
      "MediChain AI Backend Running",
  });
});

app.get(
  "/api/health",
  (_req, res) => {
    return res.status(200).json({
      success: true,
      message:
        "MediChain AI API is healthy.",
    });
  }
);

// ======================================================
// API ROUTES
// ======================================================

// IMPORTANT:
// These routes must come AFTER express.json()

app.use(
  "/api/auth",
  authRoutes
);
app.use(
  "/api/record-access",
  recordAccessRoutes
);

app.use(
  "/api/appointments",
  appointmentRoutes
);

app.use(
  "/api/medical-records",
  medicalRecordRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);

// ======================================================
// 404
// ======================================================

app.use((_req, res) => {
  return res.status(404).json({
    message:
      "API route not found.",
  });
});

// ======================================================
// DATABASE + SERVER
// ======================================================

const startServer =
  async () => {
    try {
      const mongoUri =
        process.env.MONGO_URI;

      if (!mongoUri) {
        throw new Error(
          "MONGO_URI is missing in .env file."
        );
      }

      await mongoose.connect(
        mongoUri
      );

      console.log(
        "MongoDB Connected:",
        mongoose.connection.host
      );

      app.listen(
        PORT,
        () => {
          console.log(
            "=========================================="
          );

          console.log(
            "MediChain AI Backend Running"
          );

          console.log(
            `Server: http://localhost:${PORT}`
          );

          console.log(
            `API: http://localhost:${PORT}/api`
          );

          console.log(
            "=========================================="
          );
        }
      );
    } catch (error) {
      console.error(
        "SERVER START ERROR:",
        error
      );

      process.exit(1);
    }
  };

startServer();