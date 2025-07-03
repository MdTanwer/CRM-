import axios from "axios";
import { TIME_TRACKING_API } from "../config/api.config";

// Types for session-based tracking
export interface TimeEntry {
  _id?: string;
  type: "check_in" | "check_out" | "break_start" | "break_end";
  timestamp: string | Date;
  source: "login" | "logout" | "manual";
  notes?: string;
  sessionNumber: number;
}

export interface TimeTrackingRecord {
  _id: string;
  userId: string;
  employeeId: string;
  date: Date | string;
  entries: TimeEntry[];
  checkInTime?: Date | string;
  checkOutTime?: Date | string;
  totalWorkHours: number;
  totalBreakHours: number;
  status: "checked_in" | "checked_out" | "on_break" | "session_complete";
  currentSessionNumber: number;
  totalSessions: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SessionInfo {
  sessionNumber: number;
  entries: TimeEntry[];
  status: "in_progress" | "completed";
  workDuration?: number;
  breakDuration?: number;
}

export interface SessionState {
  currentSession: SessionInfo;
  sessionState: "new_session" | "checked_in" | "on_break" | "back_from_break";
  sessionProgress: {
    completedSteps: string[];
    nextStep: string;
    totalSteps: number;
  };
  nextAction: string;
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

// Get current time tracking status (maps to getCurrentSession in backend)
export const getCurrentTimeStatus = async (): Promise<{
  timeTracking: TimeTrackingRecord;
  currentStatus: string;
  totalWorkHours: number;
  totalBreakHours: number;
}> => {
  try {
    // Try the new simplified endpoint first
    const response = await api.get("/current");
    const sessionData = response.data.data;

    // Map session data to the format expected by the dashboard
    return {
      timeTracking: {
        ...sessionData.currentSession,
        status:
          sessionData.sessionState === "on_break" ? "on_break" : "checked_in",
        totalWorkHours: sessionData.currentSession?.workDuration || 0,
        totalBreakHours: sessionData.currentSession?.breakDuration || 0,
      },
      currentStatus:
        sessionData.sessionState === "on_break" ? "on_break" : "checked_in",
      totalWorkHours: sessionData.currentSession?.workDuration || 0,
      totalBreakHours: sessionData.currentSession?.breakDuration || 0,
    };
  } catch (error: any) {
    // If the simplified endpoint fails, try the original endpoint
    try {
      const fallbackResponse = await api.get("/time-tracking/status");
      return fallbackResponse.data.data;
    } catch (fallbackError) {
      console.error("Error getting current time status:", error);
      throw error;
    }
  }
};

// Get time tracking history (maps to getHistory in backend)
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
    // Convert pagination to date range if needed
    const queryParams: any = { ...params };
    if (!queryParams.startDate && queryParams.page && queryParams.limit) {
      // Default to last 30 days if using pagination without dates
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      queryParams.startDate = startDate.toISOString().split("T")[0];
      queryParams.endDate = endDate.toISOString().split("T")[0];
    }

    const response = await api.get("/history", {
      params: queryParams,
    });

    // Add pagination info if not provided by API
    const records = response.data.data.records || [];
    return {
      records,
      pagination: response.data.data.pagination || {
        currentPage: params?.page || 1,
        totalPages: Math.ceil(records.length / (params?.limit || 10)),
        totalRecords: records.length,
      },
    };
  } catch (error: any) {
    console.error("Error getting time tracking history:", error);
    throw error;
  }
};

// Create manual time entry (maps to backend manual entry if available)
export const createManualTimeEntry = async (entryData: {
  type: "check_in" | "check_out" | "break_start" | "break_end";
  timestamp?: string;
  notes?: string;
  date?: string;
}): Promise<{ timeTracking: TimeTrackingRecord }> => {
  try {
    // Try to use entry endpoint if available
    const response = await api.post("/entry", entryData);
    return response.data.data;
  } catch (error: any) {
    console.error("Error creating manual time entry:", error);
    throw error;
  }
};

// Get current session (simplified API)
export const getCurrentSession = async (): Promise<SessionState> => {
  try {
    const response = await api.get("/session/current");
    return response.data.data;
  } catch (error: any) {
    console.error("Error getting current session:", error);
    throw error;
  }
};

// Get session history (simplified API)
export const getHistory = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<{
  records: TimeTrackingRecord[];
}> => {
  try {
    const response = await api.get("/history", { params });
    return response.data.data;
  } catch (error: any) {
    console.error("Error getting session history:", error);
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
    case "session_complete":
      return "Session Complete";
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
    case "session_complete":
      return "#ef4444"; // red
    default:
      return "#6b7280"; // gray
  }
};
