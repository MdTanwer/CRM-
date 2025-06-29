import { Request, Response, NextFunction } from "express";
import { Lead, ILead } from "../models/Lead";
import { Employee } from "../models/Employee";
import { AppError, catchAsync } from "../utils/errorHandler";
import csv from "csv-parser";
import { Readable } from "stream";

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
