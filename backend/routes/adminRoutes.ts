import express, { RequestHandler } from "express";
import { getSuperAdmin, updateSuperAdmin } from "../controller/userController";

const router = express.Router();

// Superadmin routes
router.get("/", getSuperAdmin as RequestHandler);
router.patch("/update", updateSuperAdmin as RequestHandler);

export default router;
