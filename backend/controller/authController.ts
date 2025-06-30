import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import mongoose from "mongoose";
import { Employee } from "../models/Employee";
import { AppError } from "../utils/errorHandler";
import { createAndBroadcastActivity } from "./activityController";

// JWT Secret - should be in env variables in production
const JWT_SECRET = "your-secret-key";
const JWT_EXPIRES_IN = "30d";

// Generate JWT Token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Login user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide your email and last name",
      });
    }

    // Check if employee exists with this email
    const employee = await Employee.findOne({ email });

    if (!employee) {
      return res.status(401).json({
        status: "fail",
        message: "No employee found with this email",
      });
    }

    // Verify that the provided password matches the employee's last name
    if (password.toLowerCase() !== employee.lastName.toLowerCase()) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect password. Please use your last name as password.",
      });
    }

    // Check if user account exists for this employee
    let user = (await User.findOne({ email }).select(
      "+password"
    )) as IUser | null;

    // If no user account exists, create one with lastName as password
    if (!user) {
      user = (await User.create({
        email,
        password: employee.lastName, // Password is the employee's last name
        role: "user",
      })) as IUser;
    } else {
      // Update the password to current lastName in case it changed
      const isPasswordCorrect = await user.comparePassword(employee.lastName);
      if (!isPasswordCorrect) {
        user.password = employee.lastName;
        await user.save();
      }
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(200).json({
      status: "success",
      token,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          employeeId: employee._id,
          name: `${employee.firstName} ${employee.lastName}`,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Get current user
export const getMe = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Get employee information
    const employee = await Employee.findOne({ email: user.email });

    res.status(200).json({
      status: "success",
      data: {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          employeeId: employee?._id,
          name: employee
            ? `${employee.firstName} ${employee.lastName}`
            : undefined,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Get user profile
export const getUserProfile = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Get associated employee if exists
    const employee = await Employee.findOne({ email: user.email });

    const responseData = {
      _id: user._id,
      email: user.email,
      firstName: employee?.firstName || "",
      lastName: employee?.lastName || "",
      role: user.role,
    };

    res.status(200).json({
      status: "success",
      data: {
        user: responseData,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Update user profile
export const updateUserProfile = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, password, confirmPassword } = req.body;

    // Find user
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Find associated employee if exists
    let employee = await Employee.findOne({ email: user.email });

    // Store original values for activity comparison
    const originalFirstName = employee?.firstName || "";
    const originalLastName = employee?.lastName || "";

    if (employee) {
      // Update employee details
      employee.firstName = firstName || employee.firstName;
      employee.lastName = lastName || employee.lastName;
      await employee.save();
    } else {
      // Create new employee record if it doesn't exist
      employee = await Employee.create({
        firstName: firstName || "",
        lastName: lastName || "",
        email: user.email,
        status: "active",
      });
    }

    // Handle password update if provided
    if (password) {
      // Validate that password and confirmPassword match
      if (password !== confirmPassword) {
        return res.status(400).json({
          status: "fail",
          message: "Password and confirm password do not match",
        });
      }

      // Update user password
      user.password = password;
      await user.save();
    }

    // Create and broadcast activity for profile update
    await createAndBroadcastActivity(req, {
      message: `You updated your profile`,
      type: "profile_updated",
      entityId: user._id.toString(),
      entityType: "profile",
      userId: user._id.toString(),
      userName: `${employee.firstName} ${employee.lastName}`,
      userType: user.role === "admin" ? "admin" : "employee",
      metadata: {
        profileType: "user",
        originalName: `${originalFirstName} ${originalLastName}`,
        newName: `${employee.firstName} ${employee.lastName}`,
        email: user.email,
        updatedFields: Object.keys(req.body),
        passwordUpdated: !!password,
        updatedAt: new Date().toISOString(),
      },
    });

    const responseData = {
      _id: user._id,
      email: user.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      role: user.role,
    };

    res.status(200).json({
      status: "success",
      data: {
        user: responseData,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Update password
export const updatePassword = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check if current password and new password are provided
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide both current and new password",
      });
    }

    // Find user
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Check if current password is correct
    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: "fail",
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error: any) {
    next(error);
  }
};
