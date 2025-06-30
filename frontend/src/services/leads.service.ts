import axios from "axios";
import { createAuthenticatedAxiosInstance } from "./auth.service";

const API_URL = "http://localhost:3000/api/v1/leads";

export interface Lead {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  status: "Open" | "Closed" | "Ongoing" | "Pending";
  type: "Hot" | "Warm" | "Cold";
  language: string;
  location: string;
  receivedDate: string;
  assignedEmployee?: string;
  createdAt: string;
  updatedAt: string;
}

// Get all leads assigned to the logged-in user
export const getUserLeads = async (token: string) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.get(`${API_URL}/my-leads`);
    return response.data.data.leads;
  } catch (error) {
    console.error("Error fetching user leads:", error);
    throw error;
  }
};

// Update lead status
export const updateLeadStatus = async (
  token: string,
  leadId: string,
  status: string
) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.patch(`${API_URL}/${leadId}/status`, {
      status,
    });
    return response.data.data.lead;
  } catch (error) {
    console.error("Error updating lead status:", error);
    throw error;
  }
};

// Update lead type
export const updateLeadType = async (
  token: string,
  leadId: string,
  type: string
) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.patch(`${API_URL}/${leadId}/type`, {
      type,
    });
    return response.data.data.lead;
  } catch (error) {
    console.error("Error updating lead type:", error);
    throw error;
  }
};

// Schedule a call with a lead
export const scheduleLeadCall = async (
  token: string,
  leadId: string,
  date: string,
  time: string,
  notes?: string
) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.post(`${API_URL}/${leadId}/schedule`, {
      date,
      time,
      notes,
    });
    return response.data.data.schedule;
  } catch (error) {
    console.error("Error scheduling call:", error);
    throw error;
  }
};

// Get schedules for a specific lead
export const getLeadSchedules = async (token: string, leadId: string) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.get(`${API_URL}/${leadId}/schedules`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching lead schedules:", error);
    throw error;
  }
};

// Check if lead can be closed (no future schedules)
export const canLeadBeClosed = async (token: string, leadId: string) => {
  try {
    const scheduleData = await getLeadSchedules(token, leadId);
    return !scheduleData.hasFutureSchedules;
  } catch (error) {
    console.error("Error checking if lead can be closed:", error);
    return false;
  }
};

// Get employee's schedule for a specific date
export const getEmployeeScheduleForDate = async (
  token: string,
  date: string
) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.get(`${API_URL}/my-schedule/${date}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching employee schedule for date:", error);
    throw error;
  }
};

// Check if a time slot is available for scheduling
export const isTimeSlotAvailable = async (
  token: string,
  date: string,
  time: string
) => {
  try {
    const scheduleData = await getEmployeeScheduleForDate(token, date);
    const occupiedTimes = scheduleData.occupiedTimeSlots.map(
      (slot: any) => slot.time
    );
    return !occupiedTimes.includes(time);
  } catch (error) {
    console.error("Error checking time slot availability:", error);
    return true; // If error, assume available
  }
};
