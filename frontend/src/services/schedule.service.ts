import axios from "axios";
import { LEAD_API } from "../config/api.config";

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
export const getMySchedule = async (token: string) => {
  try {
    const response = await axios.get(`${LEAD_API}/my-schedule`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching schedule:", error);
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
    const response = await axios.patch(
      `${LEAD_API}/schedule/${scheduleId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
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
    const response = await axios.patch(
      `${LEAD_API}/schedule/${scheduleId}/status`,
      { status: "cancelled" },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
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
    const response = await axios.patch(
      `${LEAD_API}/schedule/${scheduleId}/status`,
      { status: "completed" },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking call as completed:", error);
    throw error;
  }
};

// Check if lead can be closed (no future schedules)
export const canCloseLeadCheck = async (token: string, leadId: string) => {
  try {
    const response = await axios.get(`${LEAD_API}/${leadId}/can-close`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error checking if lead can be closed:", error);
    throw error;
  }
};

// Check if employee has any schedules for a specific date
export const checkEmployeeScheduleForDate = async (
  token: string,
  date: string
) => {
  try {
    const response = await axios.get(`${LEAD_API}/my-schedule/${date}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error checking employee schedule for date:", error);
    throw error;
  }
};
