import mongoose from "mongoose";

// Simple connect function
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://tanw9004167:sxqA6YAFPho0c7Pj@crm-c.lirit3n.mongodb.net/?retryWrites=true&w=majority&appName=CRM-C"
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
