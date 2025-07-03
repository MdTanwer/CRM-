import axios from "axios";
import { USER_API } from "../config/api.config";
import { createAuthenticatedAxiosInstance } from "./auth.service";

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export interface UserActivity {
  _id: string;
  message: string;
  timestamp: string;
  type: "deal_closed" | "lead_assigned";
  timeAgo: string;
  isRead: boolean;
  metadata?: {
    leadsCount?: number;
    leadNames?: string[];
    employeeName?: string;
    leadName?: string;
    [key: string]: any;
  };
}

// Get user profile
export const getUserProfile = async (token: string) => {
  try {
    const response = await axios.get(`${USER_API}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data.user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Get user recent activities (last 10)
export const getUserRecentActivities = async (
  token: string
): Promise<UserActivity[]> => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.get(`${USER_API}/recent-activities`);
    return response.data.data.activities;
  } catch (error) {
    console.error("Error fetching user recent activities:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  token: string,
  profileData: Partial<UserProfile>
) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.patch(
      `${USER_API}/profile`,
      profileData
    );
    return response.data.data.user;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Update user password
export const updateUserPassword = async (
  token: string,
  currentPassword: string,
  newPassword: string
) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.patch(`${USER_API}/update-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user password:", error);
    throw error;
  }
};
