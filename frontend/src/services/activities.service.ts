import { createAuthenticatedAxiosInstance } from "./auth.service";

const API_URL = "http://localhost:3000/api/v1/activities";

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
}

// Get recent activities (latest 5 for dashboard)
export const getRecentActivities = async (
  token: string,
  limit: number = 5
): Promise<Activity[]> => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.get(
      `${API_URL}?limit=${limit}&page=1`
    );
    return response.data.data.activities;
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    throw error;
  }
};

// Get all activities with pagination
export const getAllActivities = async (
  token: string,
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
      `${API_URL}?page=${page}&limit=${limit}`
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

// Mark activity as read
export const markActivityAsRead = async (
  token: string,
  activityId: string
): Promise<Activity> => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.patch(`${API_URL}/${activityId}/read`);
    return response.data.data.activity;
  } catch (error) {
    console.error("Error marking activity as read:", error);
    throw error;
  }
};

// Delete activity
export const deleteActivity = async (
  token: string,
  activityId: string
): Promise<void> => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    await axiosInstance.delete(`${API_URL}/${activityId}`);
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
};
