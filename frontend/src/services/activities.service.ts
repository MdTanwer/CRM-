import { createAuthenticatedAxiosInstance } from "./auth.service";
import axios from "axios";
import {
  ACTIVITY_API,
  EMPLOYEE_ACTIVITY_API,
  ADMIN_ACTIVITY_API,
} from "../config/api.config";

const API_URL = "http://localhost:3000/api/v1/activities";
const EMPLOYEE_API_URL = "http://localhost:3000/api/v1/employee-activities";
const ADMIN_API_URL = "http://localhost:3000/api/v1/admin-activities";

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

// Employee activity types
export type EmployeeActivityType =
  | "profile_updated"
  | "lead_assigned"
  | "lead_status_changed"
  | "deal_closed"
  | "call_scheduled"
  | "lead_created"
  | "user_logout"
  | "time_entry"
  | "auto_checkin"
  | "auto_checkout";

// Admin activity types
export type AdminActivityType =
  | "employee_added"
  | "employee_deleted"
  | "employee_edited"
  | "lead_assigned"
  | "lead_status_changed"
  | "deal_closed"
  | "call_scheduled"
  | "lead_created"
  | "user_logout"
  | "system_config_changed"
  | "bulk_lead_upload"
  | "employee_status_changed"
  | "admin_login"
  | "data_export"
  | "system_backup";

// Helper function to determine user type from user object
export const getUserType = (user: any): "admin" | "employee" => {
  if (!user) return "employee";
  return user.role === "admin" ? "admin" : "employee";
};

// Helper function to get appropriate API URL based on user type
export const getActivityApiUrl = (userType: "admin" | "employee"): string => {
  return userType === "admin" ? ADMIN_API_URL : EMPLOYEE_API_URL;
};

// Get recent activities (latest 5 for dashboard) - automatically determines user type
export const getRecentActivities = async (
  token: string,
  limit: number = 5,
  userType?: "admin" | "employee"
): Promise<Activity[]> => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);

    // Try to get user info to determine type if not provided
    let resolvedUserType = userType;
    if (!resolvedUserType) {
      try {
        const userResponse = await axiosInstance.get("/auth/me");
        resolvedUserType = getUserType(userResponse.data.data.user);
      } catch {
        resolvedUserType = "employee"; // fallback
      }
    }

    const apiUrl = getActivityApiUrl(resolvedUserType);
    const response = await axiosInstance.get(
      `${apiUrl}/recent?limit=${limit}&page=1`
    );
    return response.data.data.activities;
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    // Fallback to legacy API if new endpoints fail
    try {
      const axiosInstance = createAuthenticatedAxiosInstance(token);
      const response = await axiosInstance.get(
        `${API_URL}?limit=${limit}&page=1`
      );
      return response.data.data.activities;
    } catch (fallbackError) {
      console.error("Fallback API also failed:", fallbackError);
      throw error;
    }
  }
};

// Get all activities with pagination
export const getAllActivities = async (
  token: string,
  page: number = 1,
  limit: number = 20,
  userType?: "admin" | "employee"
): Promise<{
  activities: Activity[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}> => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);

    // Try to get user info to determine type if not provided
    let resolvedUserType = userType;
    if (!resolvedUserType) {
      try {
        const userResponse = await axiosInstance.get("/auth/me");
        resolvedUserType = getUserType(userResponse.data.data.user);
      } catch {
        resolvedUserType = "employee"; // fallback
      }
    }

    const apiUrl = getActivityApiUrl(resolvedUserType);
    const response = await axiosInstance.get(
      `${apiUrl}?page=${page}&limit=${limit}`
    );
    return {
      activities: response.data.data.activities,
      pagination: response.data.pagination,
    };
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
};

// Get activities for a specific user (employee activities only)
export const getActivitiesForUser = async (
  token: string,
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  activities: Activity[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}> => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.get(
      `${EMPLOYEE_API_URL}/user/${userId}?page=${page}&limit=${limit}`
    );
    return {
      activities: response.data.data.activities,
      pagination: response.data.pagination,
    };
  } catch (error) {
    console.error("Error fetching user activities:", error);
    throw error;
  }
};

// Get critical admin activities (admin only)
export const getCriticalAdminActivities = async (
  token: string,
  limit: number = 20
): Promise<Activity[]> => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.get(
      `${ADMIN_API_URL}/critical?limit=${limit}`
    );
    return response.data.data.activities;
  } catch (error) {
    console.error("Error fetching critical admin activities:", error);
    throw error;
  }
};

// Get system activities (admin only)
export const getSystemActivities = async (
  token: string,
  limit: number = 20
): Promise<Activity[]> => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.get(
      `${ADMIN_API_URL}/system?limit=${limit}`
    );
    return response.data.data.activities;
  } catch (error) {
    console.error("Error fetching system activities:", error);
    throw error;
  }
};

// Get employee management activities (admin only)
export const getEmployeeManagementActivities = async (
  token: string,
  limit: number = 20
): Promise<Activity[]> => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.get(
      `${ADMIN_API_URL}/employee-management?limit=${limit}`
    );
    return response.data.data.activities;
  } catch (error) {
    console.error("Error fetching employee management activities:", error);
    throw error;
  }
};

// Mark activity as read
export const markActivityAsRead = async (
  token: string,
  activityId: string,
  userType?: "admin" | "employee"
): Promise<Activity> => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);

    // Try to get user info to determine type if not provided
    let resolvedUserType = userType;
    if (!resolvedUserType) {
      try {
        const userResponse = await axiosInstance.get("/auth/me");
        resolvedUserType = getUserType(userResponse.data.data.user);
      } catch {
        resolvedUserType = "employee"; // fallback
      }
    }

    const apiUrl = getActivityApiUrl(resolvedUserType);
    const response = await axiosInstance.patch(`${apiUrl}/${activityId}/read`);
    return response.data.data.activity;
  } catch (error) {
    console.error("Error marking activity as read:", error);
    throw error;
  }
};

// Delete activity
export const deleteActivity = async (
  token: string,
  activityId: string,
  userType?: "admin" | "employee"
): Promise<void> => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);

    // Try to get user info to determine type if not provided
    let resolvedUserType = userType;
    if (!resolvedUserType) {
      try {
        const userResponse = await axiosInstance.get("/auth/me");
        resolvedUserType = getUserType(userResponse.data.data.user);
      } catch {
        resolvedUserType = "employee"; // fallback
      }
    }

    const apiUrl = getActivityApiUrl(resolvedUserType);
    await axiosInstance.delete(`${apiUrl}/${activityId}`);
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
};

// Create new activity (using the smart utility)
export const createActivity = async (
  token: string,
  activityData: {
    message: string;
    type: EmployeeActivityType | AdminActivityType;
    entityId?: string;
    entityType?: string;
    metadata?: Record<string, any>;
    priority?: "low" | "medium" | "high" | "critical";
  },
  userType?: "admin" | "employee"
): Promise<Activity> => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);

    // Try to get user info to determine type if not provided
    let resolvedUserType = userType;
    let userId: string | undefined;
    let userName: string | undefined;

    if (!resolvedUserType) {
      try {
        const userResponse = await axiosInstance.get("/auth/me");
        const user = userResponse.data.data.user;
        resolvedUserType = getUserType(user);
        userId = user._id || user.id;
        userName =
          user.name ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.email;
      } catch {
        resolvedUserType = "employee"; // fallback
      }
    }

    // If we still don't have user info, try to get it from localStorage
    if (!userId || !userName) {
      try {
        const userData = localStorage.getItem("user_data");
        if (userData) {
          const user = JSON.parse(userData);
          userId = user._id || user.id;
          userName =
            user.name ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.email;
        }
      } catch (error) {
        console.warn("Could not get user data from localStorage");
      }
    }

    const apiUrl = getActivityApiUrl(resolvedUserType);

    // Prepare the request payload with required fields based on user type
    const requestPayload: any = {
      ...activityData,
      userType: resolvedUserType,
    };

    // For employee activities, userId and userName are required
    if (resolvedUserType === "employee") {
      if (!userId || !userName) {
        throw new Error(
          "userId and userName are required for employee activities"
        );
      }
      requestPayload.userId = userId;
      requestPayload.userName = userName;
    }

    console.log("Creating activity with payload:", requestPayload);

    const response = await axiosInstance.post(apiUrl, requestPayload);
    return response.data.data.activity;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
};

export const getActivities = async () => {
  try {
    const response = await axios.get(ACTIVITY_API);
    return response.data;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
};

export const getEmployeeActivities = async () => {
  try {
    const response = await axios.get(EMPLOYEE_ACTIVITY_API);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee activities:", error);
    throw error;
  }
};

export const getAdminActivities = async () => {
  try {
    const response = await axios.get(ADMIN_ACTIVITY_API);
    return response.data;
  } catch (error) {
    console.error("Error fetching admin activities:", error);
    throw error;
  }
};
