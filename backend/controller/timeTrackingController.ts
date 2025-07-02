import { Request, Response, NextFunction } from "express";
import {
  TimeTracking,
  ITimeTracking,
  ITimeTrackingModel,
} from "../models/TimeTracking";
import { User, IUser } from "../models/User";
import { Employee } from "../models/Employee";

// Handle user login - auto check-in
export const handleLoginCheckIn = async (
  userId: string,
  employeeId: string,
  loginTime: Date = new Date()
) => {
  try {
    // Get today's record
    const record = await TimeTracking.getTodaysRecord(userId, employeeId);

    // Check if already checked in today
    if (record.status === "checked_in") {
      // This is a re-login (break end scenario)
      record.entries.push({
        type: "break_end",
        timestamp: loginTime,
        source: "login",
        notes: "Break ended due to login",
      });

      record.status = "checked_in";
    } else {
      // First check-in of the day
      record.entries.push({
        type: "check_in",
        timestamp: loginTime,
        source: "login",
        notes: "Auto check-in from login",
      });

      record.checkInTime = loginTime;
      record.status = "checked_in";
    }

    await record.save();
    return record;
  } catch (error) {
    console.error("Error handling login check-in:", error);
    throw error;
  }
};

// Handle user logout - auto check-out or break start
export const handleLogoutCheckOut = async (
  userId: string,
  employeeId: string,
  logoutTime: Date = new Date()
) => {
  try {
    const logoutDate = new Date(logoutTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if logout is next day (cross-day scenario)
    if (logoutDate.toDateString() !== today.toDateString()) {
      return await TimeTracking.handleCrossDayLogout(
        userId,
        employeeId,
        logoutTime
      );
    }

    // Same day logout
    const record = await TimeTracking.getTodaysRecord(userId, employeeId);

    if (record.status === "checked_in") {
      // Determine if this is end of day or just a break
      const hour = logoutDate.getHours();
      const isEndOfDay = hour >= 17 || hour < 6; // After 5 PM or before 6 AM

      if (isEndOfDay) {
        // Check out for the day
        record.entries.push({
          type: "check_out",
          timestamp: logoutTime,
          source: "logout",
          notes: "Auto checkout from logout",
        });

        record.checkOutTime = logoutTime;
        record.status = "checked_out";
        record.isCompleted = true;
      } else {
        // Start break
        record.entries.push({
          type: "break_start",
          timestamp: logoutTime,
          source: "logout",
          notes: "Break started due to logout",
        });

        record.status = "on_break";
      }

      record.calculateHours();
      await record.save();
    }

    return record;
  } catch (error) {
    console.error("Error handling logout check-out:", error);
    throw error;
  }
};

// Get current time tracking status
export const getCurrentStatus = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({
        status: "fail",
        message: "User not authenticated",
      });
      return;
    }

    const employee = await Employee.findOne({ email: user.email });
    if (!employee) {
      res.status(404).json({
        status: "fail",
        message: "Employee record not found",
      });
      return;
    }

    const record = await TimeTracking.getTodaysRecord(
      user._id.toString(),
      employee._id.toString()
    );

    res.status(200).json({
      status: "success",
      data: {
        timeTracking: record,
        currentStatus: record.status,
        totalWorkHours: record.totalWorkHours,
        totalBreakHours: record.totalBreakHours,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get time tracking history
export const getTimeTrackingHistory = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({
        status: "fail",
        message: "User not authenticated",
      });
      return;
    }

    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    const filter: any = { userId: user._id.toString() };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const records = await TimeTracking.find(filter)
      .populate("employeeId", "firstName lastName")
      .sort({ date: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await TimeTracking.countDocuments(filter);

    res.status(200).json({
      status: "success",
      data: {
        records,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalRecords: total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Manual check-in/out (for admin corrections or manual entries)
export const manualTimeEntry = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({
        status: "fail",
        message: "User not authenticated",
      });
      return;
    }

    const { type, timestamp, notes, date } = req.body;

    if (!["check_in", "check_out", "break_start", "break_end"].includes(type)) {
      res.status(400).json({
        status: "fail",
        message: "Invalid entry type",
      });
      return;
    }

    const employee = await Employee.findOne({ email: user.email });
    if (!employee) {
      res.status(404).json({
        status: "fail",
        message: "Employee record not found",
      });
      return;
    }

    const entryDate = date ? new Date(date) : new Date();
    entryDate.setHours(0, 0, 0, 0);

    let record = await TimeTracking.findOne({
      userId: user._id.toString(),
      date: entryDate,
    });

    if (!record) {
      record = await TimeTracking.create({
        userId: user._id.toString(),
        employeeId: employee._id.toString(),
        date: entryDate,
        entries: [],
        status: "checked_out",
      });
    }

    // Add the manual entry
    record.entries.push({
      type,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      source: "manual",
      notes: notes || "Manual entry",
    });

    // Update status based on entry type
    switch (type) {
      case "check_in":
        record.status = "checked_in";
        if (!record.checkInTime) record.checkInTime = new Date(timestamp);
        break;
      case "check_out":
        record.status = "checked_out";
        record.checkOutTime = new Date(timestamp);
        break;
      case "break_start":
        record.status = "on_break";
        break;
      case "break_end":
        record.status = "checked_in";
        break;
    }

    record.calculateHours();
    await record.save();

    res.status(200).json({
      status: "success",
      data: {
        timeTracking: record,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get weekly/monthly summary
export const getTimeSummary = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({
        status: "fail",
        message: "User not authenticated",
      });
      return;
    }

    const { period = "week" } = req.query; // week, month

    const now = new Date();
    let startDate: Date;

    if (period === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay()); // Start of week
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of month
    }

    startDate.setHours(0, 0, 0, 0);

    const records = await TimeTracking.find({
      userId: user._id.toString(),
      date: { $gte: startDate, $lte: now },
    }).sort({ date: 1 });

    const summary = {
      totalWorkHours: records.reduce((sum, r) => sum + r.totalWorkHours, 0),
      totalBreakHours: records.reduce((sum, r) => sum + r.totalBreakHours, 0),
      daysWorked: records.filter((r) => r.totalWorkHours > 0).length,
      averageWorkHours: 0,
      records: records.map((r) => ({
        date: r.date,
        workHours: r.totalWorkHours,
        breakHours: r.totalBreakHours,
        status: r.status,
        checkInTime: r.checkInTime,
        checkOutTime: r.checkOutTime,
      })),
    };

    summary.averageWorkHours =
      summary.daysWorked > 0 ? summary.totalWorkHours / summary.daysWorked : 0;

    res.status(200).json({
      status: "success",
      data: { summary },
    });
  } catch (error) {
    next(error);
  }
};
