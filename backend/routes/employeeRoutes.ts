import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
} from "../controller/employeeController";

const router = express.Router();

// Statistics route
router.get("/stats", getEmployeeStats);

// CRUD routes
router.route("/").get(getAllEmployees).post(createEmployee);

router
  .route("/:id")
  .get(getEmployeeById)
  .patch(updateEmployee)
  .delete(deleteEmployee);

export default router;
