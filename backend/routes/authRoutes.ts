import express, { RequestHandler } from "express";
import {
  login,
  getMe,
  logout,
  getUserDealActivities,
} from "../controller/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Public routes
router.post("/login", login as RequestHandler);

// Protected routes
router.get("/me", protect as RequestHandler, getMe as RequestHandler);
router.post("/logout", protect as RequestHandler, logout as RequestHandler);
router.get(
  "/deals",
  protect as RequestHandler,
  getUserDealActivities as RequestHandler
);

export default router;
