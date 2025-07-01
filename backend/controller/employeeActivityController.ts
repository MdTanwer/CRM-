import { Request, Response, NextFunction } from "express";
import EmployeeActivity, {
  IEmployeeActivity,
} from "../models/EmployeeActivity";
import { catchAsync } from "../utils/errorHandler";

// Create a new employee activity and broadcast it via Socket.IO
export const createEmployeeActivity = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const activityData = {
      ...req.body,
      userType: "employee",
      timestamp: new Date(),
    };

    // Validate required fields for employee activities
    if (!activityData.userId || !activityData.userName) {
      return res.status(400).json({
        status: "error",
        message: "userId and userName are required for employee activities",
      });
    }

    // Create activity in database
    const activity = await EmployeeActivity.create(activityData);

    // Get Socket.IO instance from app
    const io = req.app.get("io");

    // Format activity for broadcasting
    const broadcastData = {
      id: activity._id.toString(),
      message: activity.message,
      timeAgo: getTimeAgo(activity.timestamp),
      type: activity.type,
      timestamp: activity.timestamp.toISOString(),
      entityId: activity.entityId,
      entityType: activity.entityType,
      userId: activity.userId,
      userName: activity.userName,
      userType: activity.userType,
      metadata: activity.metadata,
    };

    // Broadcast to all connected clients with employee activity prefix
    if (io) {
      io.emit("employee_activity_update", broadcastData);
      console.log("Employee Activity broadcasted:", broadcastData);
    }

    res.status(201).json({
      status: "success",
      data: {
        activity: broadcastData,
      },
    });
  }
);

// Get recent employee activities for user dashboard
export const getRecentEmployeeActivities = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const days = parseInt(req.query.days as string) || 7;
    const userId = req.query.userId as string;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Build filter query
    let filter: any = {
      timestamp: { $gte: startDate, $lte: endDate },
    };

    // If userId is provided, filter by user
    if (userId) {
      filter.userId = userId;
    }

    // Get recent activities
    const activities = await EmployeeActivity.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    // Format activities for frontend
    const formattedActivities = activities.map((activity) => ({
      id: activity._id.toString(),
      message: activity.message,
      timeAgo: getTimeAgo(activity.timestamp),
      type: activity.type,
      timestamp: activity.timestamp.toISOString(),
      entityId: activity.entityId,
      entityType: activity.entityType,
      userId: activity.userId,
      userName: activity.userName,
      userType: activity.userType,
      metadata: activity.metadata,
      isRead: activity.isRead,
    }));

    res.status(200).json({
      status: "success",
      results: formattedActivities.length,
      data: {
        activities: formattedActivities,
        totalCount: formattedActivities.length,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      },
    });
  }
);

// Get all employee activities with pagination
export const getAllEmployeeActivities = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter query
    let filter: any = {};

    if (req.query.type) {
      filter.type = req.query.type;
    }

    if (req.query.entityType) {
      filter.entityType = req.query.entityType;
    }

    if (req.query.userId) {
      filter.userId = req.query.userId;
    }

    // Get activities with pagination
    const activities = await EmployeeActivity.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalActivities = await EmployeeActivity.countDocuments(filter);

    // Format activities for frontend
    const formattedActivities = activities.map((activity) => ({
      id: activity._id.toString(),
      message: activity.message,
      timeAgo: getTimeAgo(activity.timestamp),
      type: activity.type,
      timestamp: activity.timestamp.toISOString(),
      entityId: activity.entityId,
      entityType: activity.entityType,
      userId: activity.userId,
      userName: activity.userName,
      userType: activity.userType,
      metadata: activity.metadata,
      isRead: activity.isRead,
    }));

    res.status(200).json({
      status: "success",
      results: formattedActivities.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalActivities / limit),
        totalItems: totalActivities,
        hasNextPage: page * limit < totalActivities,
        hasPrevPage: page > 1,
      },
      data: {
        activities: formattedActivities,
      },
    });
  }
);

// Get activities for a specific employee
export const getEmployeeActivitiesByUserId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get activities for specific user
    const activities = await EmployeeActivity.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalActivities = await EmployeeActivity.countDocuments({ userId });

    // Format activities for frontend
    const formattedActivities = activities.map((activity) => ({
      id: activity._id.toString(),
      message: activity.message,
      timeAgo: getTimeAgo(activity.timestamp),
      type: activity.type,
      timestamp: activity.timestamp.toISOString(),
      entityId: activity.entityId,
      entityType: activity.entityType,
      userId: activity.userId,
      userName: activity.userName,
      userType: activity.userType,
      metadata: activity.metadata,
      isRead: activity.isRead,
    }));

    res.status(200).json({
      status: "success",
      results: formattedActivities.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalActivities / limit),
        totalItems: totalActivities,
        hasNextPage: page * limit < totalActivities,
        hasPrevPage: page > 1,
      },
      data: {
        activities: formattedActivities,
        userId,
      },
    });
  }
);

// Mark employee activity as read
export const markEmployeeActivityAsRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const activity = await EmployeeActivity.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({
        status: "error",
        message: "Employee activity not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        activity: {
          id: activity._id.toString(),
          message: activity.message,
          timeAgo: getTimeAgo(activity.timestamp),
          type: activity.type,
          timestamp: activity.timestamp.toISOString(),
          isRead: activity.isRead,
        },
      },
    });
  }
);

// Delete employee activity
export const deleteEmployeeActivity = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const activity = await EmployeeActivity.findByIdAndDelete(id);

    if (!activity) {
      return res.status(404).json({
        status: "error",
        message: "Employee activity not found",
      });
    }

    res.status(204).json({
      status: "success",
      message: "Employee activity deleted successfully",
    });
  }
);

// Utility function to calculate time ago
function getTimeAgo(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

// Helper function to create and broadcast employee activity (for use in other controllers)
export const createAndBroadcastEmployeeActivity = async (
  req: Request,
  activityData: Partial<IEmployeeActivity>
) => {
  try {
    // Ensure userType is set to employee
    const employeeActivityData = {
      ...activityData,
      userType: "employee" as const,
      timestamp: new Date(),
    };

    // Validate required fields
    if (!employeeActivityData.userId || !employeeActivityData.userName) {
      console.error(
        "Employee activity missing required fields: userId and userName"
      );
      return null;
    }

    // Create activity in database
    const activity = await EmployeeActivity.create(employeeActivityData);

    // Get Socket.IO instance
    const io = req.app.get("io");

    // Format activity for broadcasting
    const broadcastData = {
      id: activity._id.toString(),
      message: activity.message,
      timeAgo: getTimeAgo(activity.timestamp),
      type: activity.type,
      timestamp: activity.timestamp.toISOString(),
      entityId: activity.entityId,
      entityType: activity.entityType,
      userId: activity.userId,
      userName: activity.userName,
      userType: activity.userType,
      metadata: activity.metadata,
    };

    // Broadcast to all connected clients
    if (io) {
      io.emit("employee_activity_update", broadcastData);
      console.log("Employee Activity broadcasted:", broadcastData);
    }

    return activity;
  } catch (error) {
    console.error("Error creating and broadcasting employee activity:", error);
    return null;
  }
};
