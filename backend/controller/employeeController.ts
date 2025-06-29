import { Request, Response, NextFunction } from "express";
import { Employee, IEmployee } from "../models/Employee";
import { AppError, catchAsync } from "../utils/errorHandler";

// Get all employees with pagination, filtering and sorting
export const getAllEmployees = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query: any = {};

    // Filtering
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.location) {
      query.location = req.query.location;
    }

    if (req.query.language) {
      query.preferredLanguage = req.query.language;
    }

    // Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ];
    }

    // Execute query with pagination
    const employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const totalEmployees = await Employee.countDocuments(query);

    res.status(200).json({
      status: "success",
      results: employees.length,
      totalPages: Math.ceil(totalEmployees / limit),
      currentPage: page,
      totalEmployees,
      data: {
        employees,
      },
    });
  }
);

// Get employee by ID
export const getEmployeeById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return next(new AppError("No employee found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        employee,
      },
    });
  }
);

// Create new employee
export const createEmployee = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email: req.body.email });
    if (existingEmployee) {
      return next(
        new AppError("An employee with this email already exists", 400)
      );
    }

    const newEmployee = await Employee.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        employee: newEmployee,
      },
    });
  }
);

// Update employee
export const updateEmployee = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Prevent email updates to avoid duplicates
    if (req.body.email) {
      const existingEmployee = await Employee.findOne({
        email: req.body.email,
        _id: { $ne: req.params.id },
      });

      if (existingEmployee) {
        return next(
          new AppError("An employee with this email already exists", 400)
        );
      }
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return next(new AppError("No employee found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        employee,
      },
    });
  }
);

// Delete employee
export const deleteEmployee = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return next(new AppError("No employee found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

// Update employee status
export const updateEmployeeStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.status || !["active", "inactive"].includes(req.body.status)) {
      return next(new AppError("Please provide a valid status", 400));
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!employee) {
      return next(new AppError("No employee found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        employee,
      },
    });
  }
);

// Get employee statistics
export const getEmployeeStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAssignedLeads: { $sum: "$assignedLeads" },
          totalClosedLeads: { $sum: "$closedLeads" },
        },
      },
    ]);

    const locationStats = await Employee.aggregate([
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const languageStats = await Employee.aggregate([
      {
        $group: {
          _id: "$preferredLanguage",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        stats,
        locationStats,
        languageStats,
      },
    });
  }
);
