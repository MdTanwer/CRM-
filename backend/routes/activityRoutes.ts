import express from "express";
import {
  createActivity,
  getRecentActivities,
  getAllActivities,
  markAsRead,
  deleteActivity,
} from "../controller/activityController";

const router = express.Router();

// Create new activity (and broadcast via Socket.IO)
router.post("/", createActivity);

// Get recent activities for dashboard
router.get("/recent", getRecentActivities);

// Get all activities with pagination and filters
router.get("/", getAllActivities);

// Mark activity as read
router.patch("/:id/read", markAsRead);

// Delete activity
router.delete("/:id", deleteActivity);

export default router;
