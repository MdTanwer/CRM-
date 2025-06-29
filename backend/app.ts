import express, { Request, Response, NextFunction } from "express";
import connectDB from "./utils/database";
import employeeRoutes from "./routes/employeeRoutes";
// import { globalErrorHandler } from "./utils/errorHandler";
// import { config } from "./utils/config";

// Create Express app
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.get("/api/v1", (req: Request, res: Response) => {
  res.json({ message: "CRM API v1 is running" });
});

// Employee routes
app.use("/api/v1/employees", employeeRoutes);

// Global error handler
// app.use(globalErrorHandler);

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
