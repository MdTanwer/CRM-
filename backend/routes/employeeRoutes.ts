import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus,
  getEmployeeStats,
} from "../controller/employeeController";
import {
  validateEmployeeCreation,
  validateEmployeeUpdate,
  validateEmployeeId,
} from "../middleware/employeeValidator";

const router = express.Router();

// Statistics route
router.get("/stats", getEmployeeStats);

// CRUD routes
router
  .route("/")
  .get(getAllEmployees)
  .post(validateEmployeeCreation, createEmployee);

router
  .route("/:id")
  .get(validateEmployeeId, getEmployeeById)
  .patch(validateEmployeeId, validateEmployeeUpdate, updateEmployee)
  .delete(validateEmployeeId, deleteEmployee);

// Status update route
router.patch("/:id/status", validateEmployeeId, updateEmployeeStatus);

export default router;
