import { Request, Response, NextFunction } from "express";
import {
  TimeTracking,
  ITimeTracking,
  ITimeTrackingModel,
  IWorkSession,
} from "../models/TimeTracking";
import { User, IUser } from "../models/User";
import { Employee } from "../models/Employee";

// Handle user login - session-based check-in
export const handleLoginCheckIn = async (
  userId: string,
  employeeId: string,
  loginTime: Date = new Date()
) => {
  try {
    // Get today's record
    const record = await TimeTracking.getTodaysRecord(userId, employeeId);

    // Get current session state
    const sessionState = record.getSessionState();

    console.log(
      `🔄 Login Check-in - Session State: ${sessionState}, Current Session: ${record.currentSessionNumber}`
    );

    switch (sessionState) {
      case "new_session":
        // Start new session with check-in
        record.entries.push({
          type: "check_in",
          timestamp: loginTime,
          source: "login",
          notes: "Session started - Check-in from login",
          sessionNumber: record.currentSessionNumber,
        });

        record.checkInTime = record.checkInTime || loginTime; // Set first check-in time
        record.status = "checked_in";

        console.log(
          `✅ New session ${record.currentSessionNumber} started with check-in`
        );
        break;

      case "on_break":
        // End break in current session
        record.entries.push({
          type: "break_end",
          timestamp: loginTime,
          source: "login",
          notes: "Break ended - Login after break",
          sessionNumber: record.currentSessionNumber,
        });

        record.status = "checked_in";

        console.log(`✅ Break ended in session ${record.currentSessionNumber}`);
        break;

      case "checked_in":
      case "back_from_break":
        // User is already checked in or back from break
        // This shouldn't happen in normal flow, but handle gracefully
        console.log(
          `⚠️ User already checked in - Session ${record.currentSessionNumber}`
        );
        break;
    }

    // Recalculate hours and save
    record.calculateHours();
    await record.save();

    console.log(
      `💾 Session ${record.currentSessionNumber} updated - Status: ${record.status}`
    );
    return record;
  } catch (error) {
    console.error("❌ Error handling login check-in:", error);
    throw error;
  }
};

// Handle user logout - session-based check-out or break start
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
      console.log(`🌙 Cross-day logout detected`);
      return await TimeTracking.handleCrossDayLogout(
        userId,
        employeeId,
        logoutTime
      );
    }

    // Same day logout - get record
    const record = await TimeTracking.getTodaysRecord(userId, employeeId);

    // Get current session state
    const sessionState = record.getSessionState();

    console.log(
      `🔄 Logout Check-out - Session State: ${sessionState}, Current Session: ${record.currentSessionNumber}`
    );

    switch (sessionState) {
      case "checked_in":
        // First logout in session = break start
        record.entries.push({
          type: "break_start",
          timestamp: logoutTime,
          source: "logout",
          notes: "Break started - Logout during session",
          sessionNumber: record.currentSessionNumber,
        });

        record.status = "on_break";

        console.log(
          `✅ Break started in session ${record.currentSessionNumber}`
        );
        break;

      case "back_from_break":
        // Second logout in session = session complete
        record.entries.push({
          type: "check_out",
          timestamp: logoutTime,
          source: "logout",
          notes: "Session completed - Final checkout",
          sessionNumber: record.currentSessionNumber,
        });

        record.checkOutTime = logoutTime;
        record.status = "session_complete";

        // Prepare for next session
        record.currentSessionNumber += 1;

        console.log(
          `✅ Session ${
            record.currentSessionNumber - 1
          } completed. Ready for session ${record.currentSessionNumber}`
        );
        break;

      case "new_session":
      case "on_break":
        // User is not checked in or already on break
        console.log(`⚠️ Invalid logout state: ${sessionState}`);
        break;
    }

    // Recalculate hours and save
    record.calculateHours();
    await record.save();

    console.log(
      `💾 Session updated - Status: ${record.status}, Total Sessions: ${record.totalSessions}`
    );
    return record;
  } catch (error) {
    console.error("❌ Error handling logout check-out:", error);
    throw error;
  }
};

// Get current time tracking status with session information
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

    // Get session information
    const currentSession = record.getCurrentSession();
    const allSessions = record.getAllSessions();
    const sessionProgress = record.getSessionProgress();
    const sessionState = record.getSessionState();

    res.status(200).json({
      status: "success",
      data: {
        timeTracking: record,
        currentStatus: record.status,
        sessionState: sessionState,
        sessionProgress: sessionProgress,
        currentSession: currentSession,
        allSessions: allSessions,
        totalWorkHours: record.totalWorkHours,
        totalBreakHours: record.totalBreakHours,
        totalSessions: record.totalSessions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get time tracking history with session information
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

    // Add session information to each record
    const recordsWithSessions = records.map((record) => {
      const recordObj = record.toObject();
      return {
        ...recordObj,
        sessions: record.getAllSessions(),
        sessionProgress: record.getSessionProgress(),
        sessionState: record.getSessionState(),
      };
    });

    res.status(200).json({
      status: "success",
      data: {
        records: recordsWithSessions,
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

// Manual time entry with session support
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

    const { type, timestamp, notes, date, sessionNumber } = req.body;

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
        currentSessionNumber: 1,
        totalSessions: 0,
      });
    }

    // Use provided session number or current session number
    const entrySessionNumber = sessionNumber || record.currentSessionNumber;

    // Add the manual entry
    record.entries.push({
      type,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      source: "manual",
      notes: notes || "Manual entry",
      sessionNumber: entrySessionNumber,
    });

    // Update status based on entry type and session logic
    const sessionState = record.getSessionState();

    switch (type) {
      case "check_in":
        record.status = "checked_in";
        if (!record.checkInTime) record.checkInTime = new Date(timestamp);
        break;
      case "check_out":
        record.status = "session_complete";
        record.checkOutTime = new Date(timestamp);
        // Prepare for next session
        record.currentSessionNumber += 1;
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
        currentSession: record.getCurrentSession(),
        allSessions: record.getAllSessions(),
        sessionProgress: record.getSessionProgress(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get weekly/monthly summary with session breakdown
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
      totalSessions: records.reduce((sum, r) => sum + r.totalSessions, 0),
      daysWorked: records.filter((r) => r.totalWorkHours > 0).length,
      averageWorkHours: 0,
      averageSessionsPerDay: 0,
      records: records.map((r) => ({
        date: r.date,
        workHours: r.totalWorkHours,
        breakHours: r.totalBreakHours,
        sessions: r.getAllSessions(),
        totalSessions: r.totalSessions,
        status: r.status,
        checkInTime: r.checkInTime,
        checkOutTime: r.checkOutTime,
      })),
    };

    summary.averageWorkHours =
      summary.daysWorked > 0 ? summary.totalWorkHours / summary.daysWorked : 0;

    summary.averageSessionsPerDay =
      summary.daysWorked > 0 ? summary.totalSessions / summary.daysWorked : 0;

    res.status(200).json({
      status: "success",
      data: { summary },
    });
  } catch (error) {
    next(error);
  }
};

// Get current session details
export const getCurrentSession = async (
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

    const currentSession = record.getCurrentSession();
    const sessionState = record.getSessionState();
    const sessionProgress = record.getSessionProgress();

    res.status(200).json({
      status: "success",
      data: {
        currentSession,
        sessionState,
        sessionProgress,
        nextAction: getNextAction(sessionState),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Force complete current session (admin/manual action)
export const completeCurrentSession = async (
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

    const sessionState = record.getSessionState();
    const now = new Date();

    // Complete current session based on state
    switch (sessionState) {
      case "checked_in":
        // Add break start and end, then checkout
        record.entries.push(
          {
            type: "break_start",
            timestamp: now,
            source: "manual",
            notes: "Auto break start - Session completion",
            sessionNumber: record.currentSessionNumber,
          },
          {
            type: "break_end",
            timestamp: new Date(now.getTime() + 1000), // 1 second later
            source: "manual",
            notes: "Auto break end - Session completion",
            sessionNumber: record.currentSessionNumber,
          },
          {
            type: "check_out",
            timestamp: new Date(now.getTime() + 2000), // 2 seconds later
            source: "manual",
            notes: "Manual session completion",
            sessionNumber: record.currentSessionNumber,
          }
        );
        break;

      case "on_break":
        // Add break end and checkout
        record.entries.push(
          {
            type: "break_end",
            timestamp: now,
            source: "manual",
            notes: "Auto break end - Session completion",
            sessionNumber: record.currentSessionNumber,
          },
          {
            type: "check_out",
            timestamp: new Date(now.getTime() + 1000), // 1 second later
            source: "manual",
            notes: "Manual session completion",
            sessionNumber: record.currentSessionNumber,
          }
        );
        break;

      case "back_from_break":
        // Just add checkout
        record.entries.push({
          type: "check_out",
          timestamp: now,
          source: "manual",
          notes: "Manual session completion",
          sessionNumber: record.currentSessionNumber,
        });
        break;

      default:
        res.status(400).json({
          status: "fail",
          message: "No active session to complete",
        });
        return;
    }

    record.checkOutTime = now;
    record.status = "session_complete";
    record.currentSessionNumber += 1;

    record.calculateHours();
    await record.save();

    res.status(200).json({
      status: "success",
      message: "Session completed successfully",
      data: {
        completedSession: record
          .getAllSessions()
          .find((s) => s.sessionNumber === record.currentSessionNumber - 1),
        nextSessionNumber: record.currentSessionNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Start new session manually
export const startNewSession = async (
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

    const sessionState = record.getSessionState();

    if (sessionState !== "new_session") {
      res.status(400).json({
        status: "fail",
        message: `Cannot start new session. Current state: ${sessionState}`,
      });
      return;
    }

    // Start new session
    const now = new Date();
    record.entries.push({
      type: "check_in",
      timestamp: now,
      source: "manual",
      notes: "Manual session start",
      sessionNumber: record.currentSessionNumber,
    });

    record.checkInTime = record.checkInTime || now;
    record.status = "checked_in";

    record.calculateHours();
    await record.save();

    res.status(200).json({
      status: "success",
      message: "New session started successfully",
      data: {
        sessionNumber: record.currentSessionNumber,
        sessionState: record.getSessionState(),
        currentSession: record.getCurrentSession(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get session statistics
export const getSessionStats = async (
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

    const { startDate, endDate } = req.query;
    const filter: any = { userId: user._id.toString() };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const records = await TimeTracking.find(filter).sort({ date: -1 });

    const stats = {
      totalDays: records.length,
      totalSessions: records.reduce((sum, r) => sum + r.totalSessions, 0),
      totalWorkHours: records.reduce((sum, r) => sum + r.totalWorkHours, 0),
      totalBreakHours: records.reduce((sum, r) => sum + r.totalBreakHours, 0),
      averageSessionsPerDay: 0,
      averageWorkHoursPerSession: 0,
      averageBreakHoursPerSession: 0,
      sessionDistribution: {} as Record<number, number>,
      completedSessions: 0,
      incompleteSessions: 0,
    };

    // Calculate session distribution
    records.forEach((record) => {
      const sessions = record.getAllSessions();
      sessions.forEach((session) => {
        if (session.status === "completed") {
          stats.completedSessions++;
        } else {
          stats.incompleteSessions++;
        }
      });

      // Count sessions per day
      const sessionCount = record.totalSessions;
      stats.sessionDistribution[sessionCount] =
        (stats.sessionDistribution[sessionCount] || 0) + 1;
    });

    // Calculate averages
    if (records.length > 0) {
      stats.averageSessionsPerDay = stats.totalSessions / records.length;
    }

    if (stats.totalSessions > 0) {
      stats.averageWorkHoursPerSession =
        stats.totalWorkHours / stats.totalSessions;
      stats.averageBreakHoursPerSession =
        stats.totalBreakHours / stats.totalSessions;
    }

    res.status(200).json({
      status: "success",
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to determine next action
function getNextAction(sessionState: string): string {
  switch (sessionState) {
    case "new_session":
      return "Start new session (Check-in)";
    case "checked_in":
      return "Take break (Logout)";
    case "on_break":
      return "End break (Login)";
    case "back_from_break":
      return "End session (Logout)";
    default:
      return "Unknown state";
  }
}
