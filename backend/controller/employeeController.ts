import { Request, Response, NextFunction } from "express";
import { Employee, IEmployee } from "../models/Employee";
import { AppError, catchAsync } from "../utils/errorHandler";
import {
  emitEmployeeEdit,
  emitEmployeeCreated,
  emitEmployeeDeleted,
} from "../sockets/socketHandler";

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
      const searchTerm = req.query.search as string;
      const searchRegex = new RegExp(searchTerm, "i");

      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { location: searchRegex },
        { preferredLanguage: searchRegex },
        { status: searchRegex },
      ];

      // For numeric search (assignedLeads, closedLeads)
      const numericSearch = parseInt(searchTerm);
      if (!isNaN(numericSearch)) {
        query.$or.push(
          { assignedLeads: numericSearch },
          { closedLeads: numericSearch }
        );
      }
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
    const data = req.body;

    const email = data.email;
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return next(
        new AppError("An employee with this email already exists", 400)
      );
    }

    const newEmployee = await Employee.create(data);

    // Emit Socket.IO event for employee creation and save to database
    try {
      await emitEmployeeCreated(newEmployee, {
        adminId: "admin", // You can get this from req.user if authentication is implemented
        adminName: "Admin User",
        createdAt: new Date().toISOString(),
      });
    } catch (socketError) {
      console.error("Socket.IO emission/database save failed:", socketError);
      // Don't fail the request if socket emission or database save fails
    }

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

    // Emit Socket.IO event for employee edit and save to database
    try {
      await emitEmployeeEdit(employee, {
        adminId: "admin", // You can get this from req.user if authentication is implemented
        adminName: "Admin User",
        updatedFields: Object.keys(req.body),
        updatedAt: new Date().toISOString(),
      });
    } catch (socketError) {
      console.error("Socket.IO emission/database save failed:", socketError);
      // Don't fail the request if socket emission or database save fails
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
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return next(new AppError("No employee found with that ID", 404));
    }

    // Store employee details before deletion for the activity and socket emission
    const employeeData = {
      id: employee._id.toString(),
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      location: employee.location,
    };

    // Delete the employee
    await Employee.findByIdAndDelete(req.params.id);

    // Emit Socket.IO event for employee deletion and save to database
    try {
      await emitEmployeeDeleted(employeeData, {
        adminId: "admin", // You can get this from req.user if authentication is implemented
        adminName: "Admin User",
        deletedAt: new Date().toISOString(),
      });
    } catch (socketError) {
      console.error("Socket.IO emission/database save failed:", socketError);
      // Don't fail the request if socket emission or database save fails
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

// Update employee status

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

// Get recent employees for dashboard
export const getRecentEmployees = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get query parameters with defaults
    const limit = parseInt(req.query.limit as string) || 10;
    const days = parseInt(req.query.days as string) || 7; // Default to last 7 days

    // Calculate date range for recent employees
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // First, try to get employees from the specified recent period
    let recentEmployees = await Employee.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(limit);

    // Get total count of recent employees in the specified period
    const totalRecentEmployees = await Employee.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // If we don't have enough employees from the recent period, get more from all time
    if (recentEmployees.length < limit) {
      const remainingCount = limit - recentEmployees.length;

      // Get additional employees from before the recent period
      const olderEmployees = await Employee.find({
        createdAt: { $lt: startDate },
      })
        .sort({ createdAt: -1 })
        .limit(remainingCount);

      // Combine recent and older employees
      recentEmployees = [...recentEmployees, ...olderEmployees];
    }

    // Format the response data
    const formattedEmployees = recentEmployees.map((employee) => ({
      _id: employee._id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      employeeId: employee.employeeId,
      location: employee.location,
      preferredLanguage: employee.preferredLanguage,
      assignedLeads: employee.assignedLeads,
      closedLeads: employee.closedLeads,
      status: employee.status,
      avatarUrl: employee.avatarUrl,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    }));

    res.status(200).json({
      status: "success",
      results: formattedEmployees.length,
      totalRecentEmployees,
      requestedLimit: limit,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days,
      },
      data: {
        employees: formattedEmployees,
      },
    });
  }
);
