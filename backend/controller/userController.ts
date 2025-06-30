import { Request, Response, NextFunction } from "express";

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

    // Update superadmin data
    if (firstName) superAdmin.firstName = firstName;
    if (lastName) superAdmin.lastName = lastName;
    if (email) superAdmin.email = email;

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
