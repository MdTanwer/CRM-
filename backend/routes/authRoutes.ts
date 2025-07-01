import express, { RequestHandler } from "express";
import { login, getMe, logout } from "../controller/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Public routes
router.post("/login", login as RequestHandler);

// Protected routes
router.get("/me", protect as RequestHandler, getMe as RequestHandler);
router.post("/logout", protect as RequestHandler, logout as RequestHandler);

export default router;
