import { Request, Response, NextFunction } from "express";
import { createAndBroadcastActivity } from "./activityController";

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
    await createAndBroadcastActivity(req, {
      message: `You updated your admin profile`,
      type: "profile_updated",
      entityId: "superadmin",
      entityType: "profile",
      userId: "superadmin",
      userName: "Super Admin",
      userType: "admin",
      metadata: {
        profileType: "superadmin",
        originalName: `${originalFirstName} ${originalLastName}`,
        newName: `${superAdmin.firstName} ${superAdmin.lastName}`,
        originalEmail: originalEmail,
        newEmail: superAdmin.email,
        updatedFields: Object.keys(req.body),
        updatedAt: new Date().toISOString(),
      },
    });

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
