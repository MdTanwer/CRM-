import { createAuthenticatedAxiosInstance } from "./auth.service";

const API_URL = "http://localhost:3000/api/v1/leads";

export interface ScheduleItem {
  _id: string;
  leadId: string;
  name: string;
  phone?: string;
  email?: string;
  type: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "upcoming" | "completed" | "cancelled";
  createdAt: string;
}

// Get all scheduled calls for the logged-in user
export const getUserSchedule = async (token: string) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.get(`${API_URL}/my-schedule`);
    return response.data.data.schedules;
  } catch (error) {
    console.error("Error fetching user schedule:", error);
    throw error;
  }
};

// Update schedule status
export const updateScheduleStatus = async (
  token: string,
  scheduleId: string,
  status: string
) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.patch(
      `${API_URL}/schedule/${scheduleId}/status`,
      {
        status,
      }
    );
    return response.data.data.schedule;
  } catch (error) {
    console.error("Error updating schedule status:", error);
    throw error;
  }
};

// Cancel scheduled call
export const cancelScheduledCall = async (
  token: string,
  scheduleId: string
) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.patch(
      `${API_URL}/schedule/${scheduleId}/status`,
      {
        status: "cancelled",
      }
    );
    return response.data.data.schedule;
  } catch (error) {
    console.error("Error cancelling scheduled call:", error);
    throw error;
  }
};

// Mark scheduled call as completed
export const completeScheduledCall = async (
  token: string,
  scheduleId: string
) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.patch(
      `${API_URL}/schedule/${scheduleId}/status`,
      {
        status: "completed",
      }
    );
    return response.data.data.schedule;
  } catch (error) {
    console.error("Error marking call as completed:", error);
    throw error;
  }
};
