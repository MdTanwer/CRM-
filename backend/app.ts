import express, { Request, Response, NextFunction } from "express";
import connectDB from "./utils/database";
import employeeRoutes from "./routes/employeeRoutes";
import leadRoutes from "./routes/leadRoutes";
import authRoutes from "./routes/authRoutes";
import cors from "cors";
import { globalErrorHandler } from "./utils/errorHandler";
import adminRoutes from "./routes/adminRoutes";
// import { config } from "./utils/config";

// Create Express app
const app = express();

// Enable CORS for frontend requests
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.get("/api/v1", (req: Request, res: Response) => {
  res.json({ message: "CRM API v1 is running" });
});

// Auth routes
app.use("/api/v1/auth", authRoutes);

// Employee routes
app.use("/api/v1/employees", employeeRoutes);

// Lead routes
app.use("/api/v1/leads", leadRoutes);

// Admin routes - no authentication required for demo
app.use("/api/v1/admin", adminRoutes);

// Global error handler
app.use(globalErrorHandler);

// Start server
const PORT = 3000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
  }
};

// Run the server
startServer();

export default app;
