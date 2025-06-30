import { Request, Response, NextFunction } from "express";
import { Lead, ILead } from "../models/Lead";
import { Employee } from "../models/Employee";
import { AppError, catchAsync } from "../utils/errorHandler";
import csv from "csv-parser";
import { Readable } from "stream";
import { IUser } from "../models/User";
import { Schedule } from "../models/Schedule";

// Get all leads with pagination, filtering and sorting
export const getAllLeads = catchAsync(
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

    if (req.query.type) {
      query.type = req.query.type;
    }

    if (req.query.location) {
      query.location = req.query.location;
    }

    if (req.query.language) {
      query.language = req.query.language;
    }

    if (req.query.assignedEmployee) {
      query.assignedEmployee = req.query.assignedEmployee;
    }

    // Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    // Execute query with pagination
    const leads = await Lead.find(query)
      .populate("assignedEmployee", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const totalLeads = await Lead.countDocuments(query);

    res.status(200).json({
      status: "success",
      results: leads.length,
      totalPages: Math.ceil(totalLeads / limit),
      currentPage: page,
      totalLeads,
      data: {
        leads,
      },
    });
  }
);

// Get lead by ID
export const getLeadById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const lead = await Lead.findById(req.params.id).populate(
      "assignedEmployee",
      "firstName lastName email"
    );

    if (!lead) {
      return next(new AppError("No lead found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        lead,
      },
    });
  }
);

// Helper function to distribute leads
const distributeLeadToEmployee = async (
  leadData: any
): Promise<string | null> => {
  try {
    // Get all active employees
    const activeEmployees = await Employee.find({ status: "active" });

    if (activeEmployees.length === 0) {
      return null; // No active employees to assign
    }

    // Get employees with lead counts
    const employeesWithLeadCounts = await Promise.all(
      activeEmployees.map(async (employee) => {
        const assignedLeadsCount = await Lead.countDocuments({
          assignedEmployee: employee._id,
        });

        // Calculate match score based on language and location
        let matchScore = 0;

        // Perfect match - both language and location match
        if (
          employee.preferredLanguage === leadData.language &&
          employee.location === leadData.location
        ) {
          matchScore = 3; // Highest priority
        }
        // Partial match - either language or location matches
        else if (
          employee.preferredLanguage === leadData.language ||
          employee.location === leadData.location
        ) {
          matchScore = 2; // Medium priority
        }
        // No match
        else {
          matchScore = 1; // Lowest priority
        }

        return {
          employeeId: employee._id,
          assignedLeadsCount,
          matchScore,
          employee,
        };
      })
    );

    // Sort employees by match score (descending) and then by lead count (ascending)
    employeesWithLeadCounts.sort((a, b) => {
      // First sort by match score (higher is better)
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // Then sort by lead count (lower is better)
      return a.assignedLeadsCount - b.assignedLeadsCount;
    });

    // Assign to the best match
    const bestMatch = employeesWithLeadCounts[0];

    // Update employee's lead count
    await Employee.findByIdAndUpdate(bestMatch.employeeId, {
      $inc: { assignedLeads: 1 },
    });

    return bestMatch.employeeId;
  } catch (error) {
    console.error("Error distributing lead:", error);
    return null;
  }
};

// Upload and process CSV file
export const uploadCSV = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError("Please upload a CSV file", 400));
    }

    // Get distribution strategy from request
    const distributionStrategy = req.body.distributionStrategy || "smart"; // Options: "equal", "location", "language", "smart"

    const results: any[] = [];
    const errors: string[] = [];
    let successCount = 0;

    // Create a readable stream from the buffer
    const stream = Readable.from(req.file.buffer.toString());

    // Process the CSV file
    stream
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        // Process each row
        for (const row of results) {
          try {
            // Normalize field names (convert to lowercase)
            const normalizedRow: Record<string, any> = {};
            Object.keys(row).forEach((key) => {
              normalizedRow[key.toLowerCase()] = row[key];
            });

            // Validate required fields - use case-insensitive field names
            const name = normalizedRow.name || row.Name;
            const email = normalizedRow.email || row.Email;
            const phone = normalizedRow.phone || row.Phone;
            const language = normalizedRow.language || row.Language;
            const location = normalizedRow.location || row.Location;

            // Validate location is in allowed list
            const validLocations = ["Pune", "Hyderabad", "Delhi"];
            if (!validLocations.includes(location)) {
              errors.push(
                `Invalid location "${location}" for lead: ${name}. Valid locations are: ${validLocations.join(
                  ", "
                )}`
              );
              continue;
            }

            // Validate language is in allowed list
            const validLanguages = ["Hindi", "English", "Bengali", "Tamil"];
            if (!validLanguages.includes(language)) {
              errors.push(
                `Invalid language "${language}" for lead: ${name}. Valid languages are: ${validLanguages.join(
                  ", "
                )}`
              );
              continue;
            }

            if (!name) {
              errors.push(`Row missing name: ${JSON.stringify(row)}`);
              continue;
            }

            if (!email && !phone) {
              errors.push(
                `Row missing both email and phone: ${JSON.stringify(row)}`
              );
              continue;
            }

            if (!language) {
              errors.push(`Row missing language: ${JSON.stringify(row)}`);
              continue;
            }

            if (!location) {
              errors.push(`Row missing location: ${JSON.stringify(row)}`);
              continue;
            }

            // Create lead object
            const leadData: any = {
              name: name,
              language: language,
              location: location,
              status: normalizedRow.status || row.Status || "Open",
              type: normalizedRow.type || row.Type || "Warm",
              receivedDate:
                normalizedRow.receiveddate || row["Received Date"]
                  ? new Date(normalizedRow.receiveddate || row["Received Date"])
                  : new Date(),
            };

            // Add email if present
            if (email) {
              leadData.email = email;
            }

            // Add phone if present
            if (phone) {
              leadData.phone = phone;
            }

            // Handle lead assignment based on strategy
            const assignedEmployee =
              normalizedRow.assignedemployee || row["Assigned Employee"];

            if (assignedEmployee) {
              // Manual assignment - check if employee exists
              const employee = await Employee.findOne({
                email: assignedEmployee,
              });

              if (employee) {
                leadData.assignedEmployee = employee._id;
                // Increment assigned leads count for the employee
                await Employee.findByIdAndUpdate(employee._id, {
                  $inc: { assignedLeads: 1 },
                });
              } else {
                errors.push(
                  `Employee not found with email: ${assignedEmployee}`
                );
              }
            } else if (distributionStrategy !== "none") {
              // Auto-assign based on distribution strategy
              const employeeId = await distributeLeadToEmployee(leadData);
              if (employeeId) {
                leadData.assignedEmployee = employeeId;
              }
            }

            // Create lead
            await Lead.create(leadData);
            successCount++;
          } catch (error: any) {
            errors.push(
              `Error processing row: ${JSON.stringify(row)}, Error: ${
                error.message
              }`
            );
          }
        }

        // Send response
        res.status(200).json({
          status: "success",
          message: `CSV processed successfully. ${successCount} leads created.`,
          errors: errors.length > 0 ? errors : undefined,
        });
      });
  }
);

// Get lead statistics
export const getLeadStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await Lead.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const typeStats = await Lead.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const locationStats = await Lead.aggregate([
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

    const languageStats = await Lead.aggregate([
      {
        $group: {
          _id: "$language",
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
        typeStats,
        locationStats,
        languageStats,
      },
    });
  }
);

// Create new lead with distribution
export const createLead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate location is in allowed list
    const validLocations = ["Pune", "Hyderabad", "Delhi"];
    if (req.body.location && !validLocations.includes(req.body.location)) {
      return next(
        new AppError(
          `Invalid location. Valid locations are: ${validLocations.join(", ")}`,
          400
        )
      );
    }

    // Validate language is in allowed list
    const validLanguages = ["Hindi", "English", "Bengali", "Tamil"];
    if (req.body.language && !validLanguages.includes(req.body.language)) {
      return next(
        new AppError(
          `Invalid language. Valid languages are: ${validLanguages.join(", ")}`,
          400
        )
      );
    }

    // Check if we need to auto-assign
    if (!req.body.assignedEmployee && req.body.autoAssign) {
      const employeeId = await distributeLeadToEmployee(req.body);
      if (employeeId) {
        req.body.assignedEmployee = employeeId;
      }
    }

    const newLead = await Lead.create(req.body);

    // If lead was assigned to an employee, update their assigned leads count
    if (newLead.assignedEmployee) {
      await Employee.findByIdAndUpdate(newLead.assignedEmployee, {
        $inc: { assignedLeads: 1 },
      });
    }

    res.status(201).json({
      status: "success",
      data: {
        lead: newLead,
      },
    });
  }
);

// Update lead
export const updateLead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedEmployee", "firstName lastName email");

    if (!lead) {
      return next(new AppError("No lead found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        lead,
      },
    });
  }
);

// Delete lead
export const deleteLead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return next(new AppError("No lead found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

// Get leads assigned to the logged-in user
export const getMyLeads = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
) => {
  try {
    // Find the employee associated with the logged-in user
    const employee = await Employee.findOne({ email: req.user?.email });

    if (!employee) {
      return res.status(404).json({
        status: "fail",
        message: "Employee not found for this user",
      });
    }

    // Find leads assigned to this employee
    const leads = await Lead.find({ assignedEmployee: employee._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      status: "success",
      results: leads.length,
      data: {
        leads,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Update lead status
export const updateLeadStatus = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["Open", "Closed", "Ongoing", "Pending"].includes(status)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid status. Must be Open, Closed, Ongoing, or Pending",
      });
    }

    // Find the employee associated with the logged-in user
    const employee = await Employee.findOne({ email: req.user?.email });

    if (!employee) {
      return res.status(404).json({
        status: "fail",
        message: "Employee not found for this user",
      });
    }

    // Find the lead and check if it's assigned to this employee
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        status: "fail",
        message: "Lead not found",
      });
    }

    if (lead.assignedEmployee?.toString() !== employee._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to update this lead",
      });
    }

    // Check for future scheduled calls if trying to close the lead
    if (status === "Closed") {
      const currentDate = new Date();
      const currentDateString = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD format
      const currentTime = currentDate.toTimeString().slice(0, 5); // HH:MM format

      // Find upcoming scheduled calls for this lead
      const futureSchedules = await Schedule.find({
        leadId: id,
        status: "upcoming",
        $or: [
          { scheduledDate: { $gt: currentDateString } },
          {
            scheduledDate: currentDateString,
            scheduledTime: { $gt: currentTime },
          },
        ],
      });

      if (futureSchedules.length > 0) {
        return res.status(400).json({
          status: "fail",
          message:
            "Cannot close lead with future scheduled calls. Please complete or cancel scheduled calls first.",
          data: {
            futureSchedules: futureSchedules.map((schedule) => ({
              id: schedule._id,
              date: schedule.scheduledDate,
              time: schedule.scheduledTime,
            })),
          },
        });
      }

      // Auto-mark past schedules as completed if they exist
      await Schedule.updateMany(
        {
          leadId: id,
          status: "upcoming",
          $or: [
            { scheduledDate: { $lt: currentDateString } },
            {
              scheduledDate: currentDateString,
              scheduledTime: { $lte: currentTime },
            },
          ],
        },
        { status: "completed" }
      );
    }

    // Update lead status
    const previousStatus = lead.status;
    lead.status = status as "Open" | "Closed" | "Ongoing" | "Pending";

    // If status is changed to Closed, update employee's closedLeads count
    if (status === "Closed" && previousStatus !== "Closed") {
      employee.closedLeads += 1;
      await employee.save();
    }

    await lead.save();

    res.status(200).json({
      status: "success",
      data: {
        lead,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Update lead type
export const updateLeadType = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    // Validate type
    if (!["Hot", "Warm", "Cold"].includes(type)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid type. Must be Hot, Warm, or Cold",
      });
    }

    // Find the employee associated with the logged-in user
    const employee = await Employee.findOne({ email: req.user?.email });

    if (!employee) {
      return res.status(404).json({
        status: "fail",
        message: "Employee not found for this user",
      });
    }

    // Find the lead and check if it's assigned to this employee
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        status: "fail",
        message: "Lead not found",
      });
    }

    if (lead.assignedEmployee?.toString() !== employee._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to update this lead",
      });
    }

    // Update lead type
    lead.type = type as "Hot" | "Warm" | "Cold";
    await lead.save();

    res.status(200).json({
      status: "success",
      data: {
        lead,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Schedule a call with lead
export const scheduleLeadCall = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { date, time, notes } = req.body;

    // Validate date and time
    if (!date || !time) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide both date and time",
      });
    }

    // Find the employee associated with the logged-in user
    const employee = await Employee.findOne({ email: req.user?.email });

    if (!employee) {
      return res.status(404).json({
        status: "fail",
        message: "Employee not found for this user",
      });
    }

    // Find the lead and check if it's assigned to this employee
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        status: "fail",
        message: "Lead not found",
      });
    }

    if (lead.assignedEmployee?.toString() !== employee._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to schedule a call with this lead",
      });
    }

    // Check for existing schedules at the same time for this employee
    const existingSchedule = await Schedule.findOne({
      employeeId: employee._id,
      scheduledDate: date,
      scheduledTime: time,
      status: "upcoming",
    }).populate("leadId", "name");

    if (existingSchedule) {
      const conflictingLead = existingSchedule.leadId as any;
      return res.status(400).json({
        status: "fail",
        message: `You already have a call scheduled at ${time} on ${date} with lead: ${conflictingLead.name}. Please choose a different time.`,
        data: {
          conflictingSchedule: {
            id: existingSchedule._id,
            leadName: conflictingLead.name,
            date: existingSchedule.scheduledDate,
            time: existingSchedule.scheduledTime,
          },
        },
      });
    }

    // Create a new schedule record
    const schedule = await Schedule.create({
      leadId: lead._id,
      employeeId: employee._id,
      scheduledDate: date,
      scheduledTime: time,
      status: "upcoming",
      notes: notes || "",
    });

    res.status(201).json({
      status: "success",
      data: {
        schedule,
        lead: {
          _id: lead._id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Get scheduled calls for the logged-in user
export const getMySchedule = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
) => {
  try {
    // Find the employee associated with the logged-in user
    const employee = await Employee.findOne({ email: req.user?.email });

    if (!employee) {
      return res.status(404).json({
        status: "fail",
        message: "Employee not found for this user",
      });
    }

    // Find scheduled calls for this employee
    const schedules = await Schedule.find({ employeeId: employee._id })
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .populate("leadId", "name email phone type");

    // Format the schedule data for frontend
    const formattedSchedules = schedules.map((schedule) => {
      const lead = schedule.leadId as any;
      return {
        _id: schedule._id,
        leadId: lead._id,
        name: lead.name,
        phone: lead.phone || "",
        email: lead.email || "",
        type: lead.type || "Cold call",
        scheduledDate: schedule.scheduledDate,
        scheduledTime: schedule.scheduledTime,
        status: schedule.status,
        createdAt: schedule.createdAt,
      };
    });

    res.status(200).json({
      status: "success",
      results: formattedSchedules.length,
      data: {
        schedules: formattedSchedules,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Update schedule status
export const updateScheduleStatus = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["upcoming", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid status. Must be upcoming, completed, or cancelled",
      });
    }

    // Find the employee associated with the logged-in user
    const employee = await Employee.findOne({ email: req.user?.email });

    if (!employee) {
      return res.status(404).json({
        status: "fail",
        message: "Employee not found for this user",
      });
    }

    // Find the schedule and check if it belongs to this employee
    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(404).json({
        status: "fail",
        message: "Schedule not found",
      });
    }

    if (schedule.employeeId.toString() !== employee._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to update this schedule",
      });
    }

    // Update schedule status
    schedule.status = status as "upcoming" | "completed" | "cancelled";
    await schedule.save();

    res.status(200).json({
      status: "success",
      data: {
        schedule,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Get schedules for a specific lead
export const getLeadSchedules = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Find the employee associated with the logged-in user
    const employee = await Employee.findOne({ email: req.user?.email });

    if (!employee) {
      return res.status(404).json({
        status: "fail",
        message: "Employee not found for this user",
      });
    }

    // Find the lead and check if it's assigned to this employee
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        status: "fail",
        message: "Lead not found",
      });
    }

    if (lead.assignedEmployee?.toString() !== employee._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to view schedules for this lead",
      });
    }

    // Get all schedules for this lead
    const schedules = await Schedule.find({ leadId: id }).sort({
      scheduledDate: 1,
      scheduledTime: 1,
    });

    // Check for future schedules
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split("T")[0];
    const currentTime = currentDate.toTimeString().slice(0, 5);

    const futureSchedules = schedules.filter(
      (schedule) =>
        schedule.status === "upcoming" &&
        (schedule.scheduledDate > currentDateString ||
          (schedule.scheduledDate === currentDateString &&
            schedule.scheduledTime > currentTime))
    );

    res.status(200).json({
      status: "success",
      data: {
        schedules,
        hasFutureSchedules: futureSchedules.length > 0,
        futureSchedules,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Get employee's schedules for a specific date
export const getEmployeeScheduleForDate = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
) => {
  try {
    const { date } = req.params;

    // Validate date format
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide a valid date in YYYY-MM-DD format",
      });
    }

    // Find the employee associated with the logged-in user
    const employee = await Employee.findOne({ email: req.user?.email });

    if (!employee) {
      return res.status(404).json({
        status: "fail",
        message: "Employee not found for this user",
      });
    }

    // Get all schedules for this employee on the specified date
    const schedules = await Schedule.find({
      employeeId: employee._id,
      scheduledDate: date,
      status: "upcoming",
    })
      .populate("leadId", "name")
      .sort({ scheduledTime: 1 });

    // Format the occupied time slots
    const occupiedTimeSlots = schedules.map((schedule) => {
      const lead = schedule.leadId as any;
      return {
        time: schedule.scheduledTime,
        leadName: lead.name,
        scheduleId: schedule._id,
      };
    });

    res.status(200).json({
      status: "success",
      data: {
        date,
        occupiedTimeSlots,
        totalSchedules: schedules.length,
      },
    });
  } catch (error: any) {
    next(error);
  }
};
