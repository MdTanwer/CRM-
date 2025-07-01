import { Router, RequestHandler } from "express";
import {
  getCurrentStatus,
  getTimeTrackingHistory,
  manualTimeEntry,
  getTimeSummary,
} from "../controller/timeTrackingController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Protect all routes - apply middleware to each route individually
// Current status
router.get(
  "/status",
  protect as RequestHandler,
  getCurrentStatus as RequestHandler
);

// Time tracking history
router.get(
  "/history",
  protect as RequestHandler,
  getTimeTrackingHistory as RequestHandler
);

// Weekly/Monthly summary
router.get(
  "/summary",
  protect as RequestHandler,
  getTimeSummary as RequestHandler
);

// Manual time entry
router.post(
  "/entry",
  protect as RequestHandler,
  manualTimeEntry as RequestHandler
);

export default router;
