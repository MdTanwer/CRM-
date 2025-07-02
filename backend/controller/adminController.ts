import { Request, Response, NextFunction } from "express";
import { AdminActivity } from "../models/AdminActivity";

// Superadmin user data
let superAdmin = {
  firstName: "Super",
  lastName: "Admin",
  email: "admin@example.com",
  role: "superadmin",
};

// Get superadmin user
export const getSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json({
      status: "success",
      data: {
        user: superAdmin,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Update superadmin user
export const updateSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, email } = req.body;

    // Store original values for activity comparison
    const originalFirstName = superAdmin.firstName;
    const originalLastName = superAdmin.lastName;
    const originalEmail = superAdmin.email;

    // Update superadmin data
    if (firstName) superAdmin.firstName = firstName;
    if (lastName) superAdmin.lastName = lastName;
    if (email) superAdmin.email = email;

    // Create and broadcast activity for profile update

    // Return updated user
    res.status(200).json({
      status: "success",
      message: "Superadmin updated successfully",
      data: {
        user: superAdmin,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Get latest 10 admin activities
export const getLatest10Activities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find latest 10 admin activities, sorted by newest first
    const activities = await AdminActivity.find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .select(
        "type message userId userName entityType entityId priority timestamp metadata userType createdAt"
      );

    res.status(200).json({
      status: "success",
      message: `Found ${activities.length} latest admin activities`,
      data: {
        activities,
        count: activities.length,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error fetching latest 10 admin activities:", error);
    next(error);
  }
};
