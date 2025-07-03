import { Router, RequestHandler } from "express";
import {
  getCurrentStatus,
  getTimeTrackingHistory,
  manualTimeEntry,
  getTimeSummary,
  getCurrentSession,
  completeCurrentSession,
  startNewSession,
  getSessionStats,
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

// === NEW SESSION-BASED ROUTES ===

// Get current session details
router.get(
  "/session/current",
  protect as RequestHandler,
  getCurrentSession as RequestHandler
);

// Force complete current session
router.post(
  "/session/complete",
  protect as RequestHandler,
  completeCurrentSession as RequestHandler
);

// Start new session manually
router.post(
  "/session/start",
  protect as RequestHandler,
  startNewSession as RequestHandler
);

// Get session statistics
router.get(
  "/session/stats",
  protect as RequestHandler,
  getSessionStats as RequestHandler
);

export default router;
