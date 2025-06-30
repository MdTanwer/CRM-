import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  getRecentEmployees,
} from "../controller/employeeController";

const router = express.Router();

// Statistics route
router.get("/stats", getEmployeeStats);

// Recent employees route for dashboard
router.get("/recent", getRecentEmployees);

// CRUD routes
router.route("/").get(getAllEmployees).post(createEmployee);

router
  .route("/:id")
  .get(getEmployeeById)
  .patch(updateEmployee)
  .delete(deleteEmployee);

export default router;
