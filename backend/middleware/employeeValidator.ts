import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { AppError } from "../utils/errorHandler";

export const validateEmployeeCreation = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("location").notEmpty().withMessage("Location is required"),

  body("preferredLanguage")
    .notEmpty()
    .withMessage("Preferred language is required"),

  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either active or inactive"),

  body("assignedLeads")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Assigned leads must be a positive number"),

  body("closedLeads")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Closed leads must be a positive number"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((error) => error.msg)
        .join(". ");
      return next(new AppError(errorMessages, 400));
    }
    next();
  },
];

export const validateEmployeeUpdate = [
  body("firstName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either active or inactive"),

  body("assignedLeads")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Assigned leads must be a positive number"),

  body("closedLeads")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Closed leads must be a positive number"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((error) => error.msg)
        .join(". ");
      return next(new AppError(errorMessages, 400));
    }
    next();
  },
];

export const validateEmployeeId = [
  param("id")
    .notEmpty()
    .withMessage("Employee ID is required")
    .isMongoId()
    .withMessage("Please provide a valid employee ID"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((error) => error.msg)
        .join(". ");
      return next(new AppError(errorMessages, 400));
    }
    next();
  },
];
