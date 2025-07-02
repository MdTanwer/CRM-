import axios from "axios";
import { ADMIN_API } from "../config/api.config";
// Base activity interface
export interface Activity {
  id: string;
  message: string;
  timeAgo: string;
  type: string;
  timestamp: string;
  entityId?: string;
  entityType?: string;
  metadata?: any;
  isRead?: boolean;
  userType?: "admin" | "employee";
  userId?: string;
  userName?: string;
  priority?: "low" | "medium" | "high" | "critical";
}

// Admin Activity interface (from backend)
export interface AdminActivity {
  _id: string;
  type: string;
  message: string;
  userId: string;
  userName: string;
  entityType?: string;
  entityId?: string;
  priority: "low" | "medium" | "high" | "critical";
  timestamp: string;
  metadata?: {
    employeeId?: string;
    employeeName?: string;
    socketMessage?: string;
    updatedFields?: string[];
    email?: string;
    location?: string;
    preferredLanguage?: string;
    status?: string;
    [key: string]: any;
  };
  userType: string;
  createdAt: string;
}

// Helper function to calculate time ago
const calculateTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

// Convert AdminActivity to Activity format
const convertAdminActivityToActivity = (
  adminActivity: AdminActivity
): Activity => {
  const timeAgo = calculateTimeAgo(adminActivity.timestamp);

  return {
    id: adminActivity._id,
    message: adminActivity.message,
    timeAgo,
    type: adminActivity.type,
    timestamp: adminActivity.timestamp,
    entityId: adminActivity.entityId,
    entityType: adminActivity.entityType,
    metadata: adminActivity.metadata,
    isRead: false,
    userType: "admin",
    userId: adminActivity.userId,
    userName: adminActivity.userName,
    priority: adminActivity.priority,
  };
};

// Fetch admin activities - returns only the data array
export const fetchAdminActivities = async (): Promise<Activity[]> => {
  try {
    const response = await axios.get(`${ADMIN_API}/activities`);

    console.log("Admin activities fetched:", response.data);

    // Extract activities from response and convert to Activity format
    const adminActivities: AdminActivity[] = response.data.data.activities;

    return adminActivities.map(convertAdminActivityToActivity);
  } catch (error: any) {
    console.error("Error fetching admin activities:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch admin activities"
    );
  }
};
