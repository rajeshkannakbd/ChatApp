import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to DB");
    });

    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error("Error connecting to database:", error.message);
    process.exit(1);
  }
};
