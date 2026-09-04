import mongoose from "mongoose";

export default async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI is not configured.");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}
