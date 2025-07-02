import express, { RequestHandler } from "express";
import {
  getLatest10Activities,
  getSuperAdmin,
  updateSuperAdmin,
} from "../controller/adminController";

const router = express.Router();

// Superadmin routes
router.get("/", getSuperAdmin as RequestHandler);
router.patch("/update", updateSuperAdmin as RequestHandler);
router.get("/activities", getLatest10Activities as RequestHandler);

export default router;
