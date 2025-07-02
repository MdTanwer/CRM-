import express, { RequestHandler } from "express";
import { getSuperAdmin, updateSuperAdmin } from "../controller/userController";
import { emitNotification } from "../sockets/socketHandler";
import { AdminActivity } from "../models/AdminActivity";

const router = express.Router();

// Superadmin routes
router.get("/", getSuperAdmin as RequestHandler);
router.patch("/update", updateSuperAdmin as RequestHandler);

// Test endpoint to verify Socket.IO and automatic database saving is working
router.post("/test-socket", async (req, res) => {
  try {
    const testMessage = "Socket.IO and database test message";

    // Emit Socket.IO notification
    emitNotification("test", testMessage, {
      timestamp: new Date().toISOString(),
      test: true,
    });

    // Save test admin activity directly to MongoDB adminactivity collection
    const adminActivity = await AdminActivity.create({
      type: "system_config_changed",
      message: "Admin tested Socket.IO and database integration",
      userId: "admin",
      userName: "Test Admin",
      entityType: "system",
      priority: "low",
      metadata: {
        socketMessage: testMessage,
        testType: "socket_and_database",
        timestamp: new Date().toISOString(),
      },
      userType: "admin",
      timestamp: new Date(),
    });

    res.status(200).json({
      status: "success",
      message:
        "Socket.IO test notification sent and activity saved to adminactivity collection",
      data: {
        socketMessage: testMessage,
        savedActivity: {
          id: adminActivity._id,
          type: adminActivity.type,
          message: adminActivity.message,
          timestamp: adminActivity.timestamp,
        },
      },
    });
  } catch (error: any) {
    console.error("Test endpoint error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to send Socket.IO notification or save to database",
      error: error.message,
    });
  }
});

export default router;
