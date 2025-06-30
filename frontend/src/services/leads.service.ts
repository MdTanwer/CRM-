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
