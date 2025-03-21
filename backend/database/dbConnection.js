import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI || !process.env.DB_NAME) {
      console.error(
        "Missing MongoDB URI or Database name in environment variables."
      );
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on("connected", () => {
      console.log("Mongoose connection established.");
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose connection disconnected.");
    });

    mongoose.connection.on("error", (error) => {
      console.error(`Mongoose connection error: ${error.message}`);
    });

    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};
