import express, { RequestHandler } from "express";
import {
  login,
  getMe,
  getUserProfile,
  updateUserProfile,
  updatePassword,
  getUserRecentActivities,
} from "../controller/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Authentication routes
router.post("/login", login as RequestHandler);
router.get("/me", protect as RequestHandler, getMe as RequestHandler);

// Profile routes
router.get(
  "/profile",
  protect as RequestHandler,
  getUserProfile as RequestHandler
);
router.patch(
  "/profile",
  protect as RequestHandler,
  updateUserProfile as RequestHandler
);
router.patch(
  "/update-password",
  protect as RequestHandler,
  updatePassword as RequestHandler
);

// Activity routes
router.get(
  "/recent-activities",
  protect as RequestHandler,
  getUserRecentActivities as RequestHandler
);

export default router;
