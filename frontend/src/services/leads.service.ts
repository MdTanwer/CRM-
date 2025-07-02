import axios from "axios";
import { createAuthenticatedAxiosInstance } from "./auth.service";
import type { Lead } from "../types";
import { LEAD_API } from "../config/api.config";

// Get my assigned leads
export const getMyLeads = async (token: string) => {
  try {
    const authAxios = createAuthenticatedAxiosInstance(token);
    const response = await authAxios.get(`${LEAD_API}/my-leads`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Update lead status
export const updateLeadStatus = async (
  token: string,
  leadId: string,
  status: string
) => {
  try {
    const authAxios = createAuthenticatedAxiosInstance(token);
    const response = await authAxios.put(`${LEAD_API}/${leadId}/status`, {
      status,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Update lead type
export const updateLeadType = async (
  token: string,
  leadId: string,
  type: string
) => {
  try {
    const authAxios = createAuthenticatedAxiosInstance(token);
    const response = await authAxios.put(`${LEAD_API}/${leadId}/type`, {
      type,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Schedule a call with lead
export const scheduleCall = async (
  token: string,
  leadId: string,
  date: string,
  time: string,
  notes?: string
) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.post(
      `${LEAD_API}/${leadId}/schedule`,
      {
        date,
        time,
        notes,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error scheduling call:", error);
    throw error;
  }
};

// Get lead schedules
export const getLeadSchedules = async (token: string, leadId: string) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.get(`${LEAD_API}/${leadId}/schedules`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching lead schedules:", error);
    throw error;
  }
};

// Get employee schedule for date
export const getEmployeeScheduleForDate = async (
  token: string,
  date: string
) => {
  try {
    const axiosInstance = createAuthenticatedAxiosInstance(token);
    const response = await axiosInstance.get(`${LEAD_API}/my-schedule/${date}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching employee schedule:", error);
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

// API functions for leads (no auth required for some)
export const leadsAPI = {
  // Get all leads with query parameters
  getAllLeads: async (params: any = {}) => {
    const response = await axios.get(LEAD_API, { params });
    return response.data;
  },

  // Get lead by ID
  getLeadById: async (id: string) => {
    const response = await axios.get(`${LEAD_API}/${id}`);
    return response.data;
  },

  // Create new lead
  createLead: async (leadData: Partial<Lead>) => {
    const response = await axios.post(LEAD_API, leadData);
    return response.data;
  },

  // Update lead
  updateLead: async (id: string, leadData: Partial<Lead>) => {
    const response = await axios.put(`${LEAD_API}/${id}`, leadData);
    return response.data;
  },

  // Delete lead
  deleteLead: async (id: string) => {
    const response = await axios.delete(`${LEAD_API}/${id}`);
    return response.data;
  },

  // Upload CSV
  uploadCSV: async (formData: FormData) => {
    const response = await axios.post(`${LEAD_API}/upload-csv`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get lead statistics
  getLeadStats: async () => {
    const response = await axios.get(`${LEAD_API}/stats`);
    return response.data;
  },

  // Get recent leads
  getRecentLeads: async (limit = 10) => {
    const response = await axios.get(`${LEAD_API}/recent`, {
      params: { limit },
    });
    return response.data;
  },

  // Get unassigned leads count
  getUnassignedLeadsCount: async () => {
    const response = await axios.get(`${LEAD_API}/unassigned/count`);
    return response.data;
  },
};
