import mongoose from "mongoose";

const connectDB =
  async () => {
    try {
      const mongoUri =
        process.env.MONGO_URI;

      if (!mongoUri) {
        throw new Error(
          "MONGO_URI is not configured in .env"
        );
      }

      const connection =
        await mongoose.connect(
          mongoUri
        );

      console.log(
        `MongoDB Connected: ${connection.connection.host}`
      );
    } catch (error) {
      console.error(
        "MongoDB Connection Error:",
        error
      );

      process.exit(1);
    }
  };

export default connectDB;