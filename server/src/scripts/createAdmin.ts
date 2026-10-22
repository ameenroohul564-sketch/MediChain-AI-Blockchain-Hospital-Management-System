import dotenv from "dotenv";

import bcrypt from "bcryptjs";

import mongoose from "mongoose";

import User from "../models/User.js";

dotenv.config();

const createAdmin =
  async () => {
    try {
      const mongoUri =
        process.env.MONGO_URI;

      if (!mongoUri) {
        throw new Error(
          "MONGO_URI is not configured."
        );
      }

      await mongoose.connect(
        mongoUri
      );

      const fullName =
        "System Admin";

      const email =
        "admin@gmail.com";

      const password =
        "admin123";

      const existingAdmin =
        await User.findOne({
          email,
        });

      if (existingAdmin) {
        console.log(
          "Admin already exists."
        );

        console.log(
          "Email:",
          existingAdmin.email
        );

        await mongoose.disconnect();

        return;
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const admin =
        await User.create({
          fullName,
          email,
          password:
            hashedPassword,
          role: "admin",
        });

      console.log(
        "Admin created successfully"
      );

      console.log(
        "Name:",
        admin.fullName
      );

      console.log(
        "Email:",
        admin.email
      );

      console.log(
        "Password:",
        password
      );

      await mongoose.disconnect();
    } catch (error) {
      console.error(
        "CREATE ADMIN ERROR:",
        error
      );

      await mongoose.disconnect();

      process.exit(1);
    }
  };

createAdmin();