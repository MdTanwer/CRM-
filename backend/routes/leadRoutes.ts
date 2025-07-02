import express, { RequestHandler } from "express";
import multer from "multer";
import {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  uploadCSV,
  getLeadStats,
  getMyLeads,
  updateLeadStatus,
  updateLeadType,
  scheduleLeadCall,
  getMySchedule,
  updateScheduleStatus,
  getLeadSchedules,
  getEmployeeScheduleForDate,
  getSalesAnalytics,
  getRecentLeads,
  getUnassignedLeadsCount,
  getAssignedLeadsCount,
  getTotalLeadsCount,
  getClosedLeadsCount,
} from "../controller/leadController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept only CSV files
    if (
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Statistics route
router.get("/stats", getLeadStats);

// Sales analytics route
router.get("/sales-analytics", getSalesAnalytics);

// Recent leads route for dashboard
router.get("/recent", getRecentLeads);

// Get count of unassigned leads - MOVED UP to avoid conflict with /:id route
router.get("/unassigned/count", getUnassignedLeadsCount);
router.get("/assigned/count", getAssignedLeadsCount);
router.get("/total/count", getTotalLeadsCount);
router.get("/closed/count", getClosedLeadsCount);
// CSV upload route
router.post("/upload-csv", upload.single("file"), uploadCSV);

// Get leads assigned to the logged-in user
router.get(
  "/my-leads",
  protect as RequestHandler,
  getMyLeads as RequestHandler
);

// Update lead status and type
router.patch(
  "/:id/status",
  protect as RequestHandler,
  updateLeadStatus as RequestHandler
);
router.patch(
  "/:id/type",
  protect as RequestHandler,
  updateLeadType as RequestHandler
);

// Schedule routes
router.post(
  "/:id/schedule",
  protect as RequestHandler,
  scheduleLeadCall as RequestHandler
);

// Get schedules for a specific lead
router.get(
  "/:id/schedules",
  protect as RequestHandler,
  getLeadSchedules as RequestHandler
);

router.get(
  "/my-schedule",
  protect as RequestHandler,
  getMySchedule as RequestHandler
);

// Get employee's schedule for a specific date
router.get(
  "/my-schedule/:date",
  protect as RequestHandler,
  getEmployeeScheduleForDate as RequestHandler
);

router.patch(
  "/schedule/:id/status",
  protect as RequestHandler,
  updateScheduleStatus as RequestHandler
);

// CRUD routes
router.route("/").get(getAllLeads).post(createLead);

router.route("/:id").get(getLeadById).patch(updateLead).delete(deleteLead);

export default router;
