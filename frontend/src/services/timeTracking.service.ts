import axios from "axios";
import { TIME_TRACKING_API } from "../config/api.config";

// Types
export interface TimeEntry {
  _id: string;
  employeeId: string;
  date: string;
  type: "check_in" | "check_out" | "break_start" | "break_end";
  timestamp: string;
  checkInTime?: string;
  checkOutTime?: string;
  breaks: Break[];
  totalWorkTime: number;
  status: "present" | "absent" | "partial";
  createdAt: string;
  updatedAt: string;
}

export interface Break {
  startTime: string;
  endTime?: string;
  duration?: number;
  type: "lunch" | "tea" | "personal" | "other";
  reason?: string;
}

// Auth helper
const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

// Check in
export const checkIn = async (token: string) => {
  try {
    const response = await axios.post(
      `${TIME_TRACKING_API}/checkin`,
      {},
      { headers: getAuthHeaders(token) }
    );
    return response.data;
  } catch (error) {
    console.error("Error checking in:", error);
    throw error;
  }
};

// Create axios instance with default config
const api = axios.create({
  baseURL: TIME_TRACKING_API,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface TimeTrackingRecord {
  _id: string;
  userId: string;
  employeeId: string;
  date: Date;
  entries: TimeEntry[];
  checkInTime?: Date;
  checkOutTime?: Date;
  totalWorkHours: number;
  totalBreakHours: number;
  status: "checked_in" | "checked_out" | "on_break" | "auto_checkout";
  isCompleted: boolean;
  crossDayLogout?: {
    originalLogoutTime: Date;
    adjustedCheckoutTime: Date;
    nextDayCheckInTime: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSummary {
  totalWorkHours: number;
  totalBreakHours: number;
  daysWorked: number;
  averageWorkHours: number;
  records: Array<{
    date: Date;
    workHours: number;
    breakHours: number;
    status: string;
    checkInTime?: Date;
    checkOutTime?: Date;
  }>;
}

// Get current time tracking status
export const getCurrentTimeStatus = async (): Promise<{
  timeTracking: TimeTrackingRecord;
  currentStatus: string;
  totalWorkHours: number;
  totalBreakHours: number;
}> => {
  try {
    const response = await api.get("/time-tracking/status");
    return response.data.data;
  } catch (error: any) {
    console.error("Error getting current time status:", error);
    throw error;
  }
};

// Get time tracking history
export const getTimeTrackingHistory = async (params?: {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{
  records: TimeTrackingRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  };
}> => {
  try {
    const response = await api.get("/time-tracking/history", { params });
    return response.data.data;
  } catch (error: any) {
    console.error("Error getting time tracking history:", error);
    throw error;
  }
};

// Create manual time entry
export const createManualTimeEntry = async (entryData: {
  type: "check_in" | "check_out" | "break_start" | "break_end";
  timestamp?: string;
  notes?: string;
  date?: string;
}): Promise<{ timeTracking: TimeTrackingRecord }> => {
  try {
    const response = await api.post("/time-tracking/entry", entryData);
    return response.data.data;
  } catch (error: any) {
    console.error("Error creating manual time entry:", error);
    throw error;
  }
};

// Get time summary (weekly/monthly)
export const getTimeSummary = async (
  period: "week" | "month" = "week"
): Promise<{
  summary: TimeSummary;
}> => {
  try {
    const response = await api.get("/time-tracking/summary", {
      params: { period },
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Error getting time summary:", error);
    throw error;
  }
};

// Format time duration
export const formatHours = (hours: number): string => {
  if (hours === 0) return "0h 0m";

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours % 1) * 60);

  if (wholeHours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${wholeHours}h`;
  }

  return `${wholeHours}h ${minutes}m`;
};

// Check if user is currently checked in
export const isUserCheckedIn = (status: string): boolean => {
  return status === "checked_in" || status === "on_break";
};

// Get status display text
export const getStatusDisplayText = (status: string): string => {
  switch (status) {
    case "checked_in":
      return "Checked In";
    case "checked_out":
      return "Checked Out";
    case "on_break":
      return "On Break";
    case "auto_checkout":
      return "Auto Checked Out";
    default:
      return "Unknown";
  }
};

// Get status color for UI
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "checked_in":
      return "#22c55e"; // green
    case "on_break":
      return "#f59e0b"; // yellow
    case "checked_out":
    case "auto_checkout":
      return "#ef4444"; // red
    default:
      return "#6b7280"; // gray
  }
};
