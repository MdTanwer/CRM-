import express from "express";
import {
  createAdminActivity,
  getRecentAdminActivities,
  getAllAdminActivities,
  getCriticalAdminActivities,
  getSystemActivities,
  getEmployeeManagementActivities,
  markAdminActivityAsRead,
  deleteAdminActivity,
} from "../controller/adminActivityController";

const router = express.Router();

// Create a new admin activity
router.post("/", createAdminActivity);

// Get recent admin activities
router.get("/recent", getRecentAdminActivities);

// Get all admin activities with pagination
router.get("/", getAllAdminActivities);

// Get critical admin activities
router.get("/critical", getCriticalAdminActivities);

// Get system activities (config changes, backups, exports)
router.get("/system", getSystemActivities);

// Get employee management activities
router.get("/employee-management", getEmployeeManagementActivities);

// Mark admin activity as read
router.patch("/:id/read", markAdminActivityAsRead);

// Delete admin activity
router.delete("/:id", deleteAdminActivity);

export default router;
