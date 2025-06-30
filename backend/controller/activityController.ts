import { Request, Response, NextFunction } from "express";
import Activity, { IActivity } from "../models/Activity";
import { catchAsync } from "../utils/errorHandler";

// Create a new activity and broadcast it via Socket.IO
export const createActivity = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const activityData = {
      ...req.body,
      timestamp: new Date(),
    };

    // Create activity in database
    const activity = await Activity.create(activityData);

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
      metadata: activity.metadata,
    };

    // Broadcast to all connected clients
    if (io) {
      io.emit("activity_update", broadcastData);
      console.log("Activity broadcasted:", broadcastData);
    }

    res.status(201).json({
      status: "success",
      data: {
        activity: broadcastData,
      },
    });
  }
);

// Get recent activities for dashboard
export const getRecentActivities = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const days = parseInt(req.query.days as string) || 7;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Get recent activities
    const activities = await Activity.find({
      timestamp: { $gte: startDate, $lte: endDate },
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

// Get all activities with pagination
export const getAllActivities = catchAsync(
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
    const activities = await Activity.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalActivities = await Activity.countDocuments(filter);

    // Format activities for frontend
    const formattedActivities = activities.map((activity) => ({
      id: activity._id.toString(),
      message: activity.message,
      timeAgo: getTimeAgo(activity.timestamp),
      type: activity.type,
      timestamp: activity.timestamp.toISOString(),
      entityId: activity.entityId,
      entityType: activity.entityType,
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

// Mark activity as read
export const markAsRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const activity = await Activity.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({
        status: "error",
        message: "Activity not found",
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

// Delete activity
export const deleteActivity = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const activity = await Activity.findByIdAndDelete(id);

    if (!activity) {
      return res.status(404).json({
        status: "error",
        message: "Activity not found",
      });
    }

    res.status(204).json({
      status: "success",
      message: "Activity deleted successfully",
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

// Helper function to create and broadcast activity (for use in other controllers)
export const createAndBroadcastActivity = async (
  req: Request,
  activityData: Partial<IActivity>
) => {
  try {
    // Create activity in database
    const activity = await Activity.create({
      ...activityData,
      timestamp: new Date(),
    });

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
      metadata: activity.metadata,
    };

    // Broadcast to all connected clients
    if (io) {
      io.emit("activity_update", broadcastData);
      console.log("Activity broadcasted:", broadcastData);
    }

    return activity;
  } catch (error) {
    console.error("Error creating and broadcasting activity:", error);
    return null;
  }
};
