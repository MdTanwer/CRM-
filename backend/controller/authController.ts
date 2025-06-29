import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import mongoose from "mongoose";
import { Employee } from "../models/Employee";

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
    const { email } = req.body;

    // Check if email exists
    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide your email",
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

    // Check if user account exists for this employee
    let user = (await User.findOne({ email }).select(
      "+password"
    )) as IUser | null;

    // If no user account exists, create one with email as password
    if (!user) {
      user = (await User.create({
        email,
        password: email, // Password is the same as email
        role: "user",
      })) as IUser;
    }

    // Verify password (which is the same as email)
    const isPasswordCorrect = await user.comparePassword(email);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect password. Please use your email as password.",
      });
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
