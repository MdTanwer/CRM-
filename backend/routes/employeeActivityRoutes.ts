import express from "express";
import {
  createEmployeeActivity,
  getRecentEmployeeActivities,
  getAllEmployeeActivities,
  getEmployeeActivitiesByUserId,
  markEmployeeActivityAsRead,
  deleteEmployeeActivity,
} from "../controller/employeeActivityController";

const router = express.Router();

// Create a new employee activity
router.post("/", createEmployeeActivity);

// Get recent employee activities
router.get("/recent", getRecentEmployeeActivities);

// Get all employee activities with pagination
router.get("/", getAllEmployeeActivities);

// Get activities for a specific employee
router.get("/user/:userId", getEmployeeActivitiesByUserId);

// Mark employee activity as read
router.patch("/:id/read", markEmployeeActivityAsRead);

// Delete employee activity
router.delete("/:id", deleteEmployeeActivity);

export default router;
