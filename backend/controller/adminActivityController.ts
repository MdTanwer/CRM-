import { Request, Response, NextFunction } from "express";
import AdminActivity, { IAdminActivity } from "../models/AdminActivity";
import { catchAsync } from "../utils/errorHandler";

// Create a new admin activity and broadcast it via Socket.IO
export const createAdminActivity = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const activityData = {
      ...req.body,
      userType: "admin",
      timestamp: new Date(),
    };

    // Create activity in database
    const activity = await AdminActivity.create(activityData);

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
      priority: activity.priority,
    };

    // Broadcast to all connected clients with admin activity prefix
    if (io) {
      io.emit("admin_activity_update", broadcastData);
      console.log("Admin Activity broadcasted:", broadcastData);
    }

    res.status(201).json({
      status: "success",
      data: {
        activity: broadcastData,
      },
    });
  }
);

// Get recent admin activities for admin dashboard
export const getRecentAdminActivities = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const days = parseInt(req.query.days as string) || 7;
    const priority = req.query.priority as string;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Build filter query
    let filter: any = {
      timestamp: { $gte: startDate, $lte: endDate },
    };

    // If priority is provided, filter by priority
    if (priority) {
      filter.priority = priority;
    }

    // Get recent activities
    const activities = await AdminActivity.find(filter)
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
      priority: activity.priority,
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

// Get all admin activities with pagination
export const getAllAdminActivities = catchAsync(
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

    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    if (req.query.userId) {
      filter.userId = req.query.userId;
    }

    // Get activities with pagination
    const activities = await AdminActivity.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalActivities = await AdminActivity.countDocuments(filter);

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
      priority: activity.priority,
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

// Get critical admin activities
export const getCriticalAdminActivities = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 20;

    // Get critical activities
    const activities = await AdminActivity.find({ priority: "critical" })
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
      priority: activity.priority,
      isRead: activity.isRead,
    }));

    res.status(200).json({
      status: "success",
      results: formattedActivities.length,
      data: {
        activities: formattedActivities,
      },
    });
  }
);

// Get system activities (config changes, backups, exports)
export const getSystemActivities = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 20;

    // Get system-related activities
    const activities = await AdminActivity.find({
      type: {
        $in: ["system_config_changed", "data_export", "system_backup"],
      },
    })
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
      priority: activity.priority,
      isRead: activity.isRead,
    }));

    res.status(200).json({
      status: "success",
      results: formattedActivities.length,
      data: {
        activities: formattedActivities,
      },
    });
  }
);

// Get employee management activities
export const getEmployeeManagementActivities = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 20;

    // Get employee management activities
    const activities = await AdminActivity.find({
      type: {
        $in: [
          "employee_added",
          "employee_deleted",
          "employee_edited",
          "employee_status_changed",
        ],
      },
    })
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
      priority: activity.priority,
      isRead: activity.isRead,
    }));

    res.status(200).json({
      status: "success",
      results: formattedActivities.length,
      data: {
        activities: formattedActivities,
      },
    });
  }
);

// Mark admin activity as read
export const markAdminActivityAsRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const activity = await AdminActivity.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({
        status: "error",
        message: "Admin activity not found",
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
          priority: activity.priority,
          isRead: activity.isRead,
        },
      },
    });
  }
);

// Delete admin activity
export const deleteAdminActivity = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const activity = await AdminActivity.findByIdAndDelete(id);

    if (!activity) {
      return res.status(404).json({
        status: "error",
        message: "Admin activity not found",
      });
    }

    res.status(204).json({
      status: "success",
      message: "Admin activity deleted successfully",
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

// Helper function to create and broadcast admin activity (for use in other controllers)
export const createAndBroadcastAdminActivity = async (
  req: Request,
  activityData: Partial<IAdminActivity>
) => {
  try {
    // Ensure userType is set to admin
    const adminActivityData = {
      ...activityData,
      userType: "admin" as const,
      timestamp: new Date(),
    };

    // Create activity in database
    const activity = await AdminActivity.create(adminActivityData);

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
      priority: activity.priority,
    };

    // Broadcast to all connected clients
    if (io) {
      io.emit("admin_activity_update", broadcastData);
      console.log("Admin Activity broadcasted:", broadcastData);
    }

    return activity;
  } catch (error) {
    console.error("Error creating and broadcasting admin activity:", error);
    return null;
  }
};
