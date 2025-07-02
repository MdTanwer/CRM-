import express, { Request, Response, NextFunction } from "express";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./utils/database";
import employeeRoutes from "./routes/employeeRoutes";
import leadRoutes from "./routes/leadRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import timeTrackingRoutes from "./routes/timeTrackingRoutes";
import cors from "cors";
import { globalErrorHandler } from "./utils/errorHandler";
import adminRoutes from "./routes/adminRoutes";

// import { config } from "./utils/config";

// Create Express app
const app = express();
const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

// Make io accessible to other modules

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

// User routes
app.use("/api/v1/users", userRoutes);

// Employee routes
app.use("/api/v1/employees", employeeRoutes);

// Lead routes
app.use("/api/v1/leads", leadRoutes);

// Activity routes (legacy - keep for backward compatibility)

// Employee activity routes (new separated routes)
// app.use("/api/v1/employee-activities", employeeActivityRoutes);

// Time tracking routes
app.use("/api/v1/time-tracking", timeTrackingRoutes);

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

    // Start server with Socket.IO
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.IO server ready for connections`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
  }
};

// Run the server
startServer();

export default app;
