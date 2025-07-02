// API Configuration
const getApiBaseUrl = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Check if we're in development or production
  if (import.meta.env.DEV) {
    return "http://localhost:3000/api/v1";
  }

  // Production fallback - you can customize this
  return "/api/v1";
};

export const API_BASE_URL = getApiBaseUrl();

// Socket.IO Base URL (without /api/v1)
export const SOCKET_BASE_URL = API_BASE_URL.replace("/api/v1", "");

// Auth endpoints
export const AUTH_API = `${API_BASE_URL}/auth`;

// Admin endpoints
export const ADMIN_API = `${API_BASE_URL}/admin`;

// Employee endpoints
export const EMPLOYEE_API = `${API_BASE_URL}/employees`;

// Lead endpoints
export const LEAD_API = `${API_BASE_URL}/leads`;

// User endpoints
export const USER_API = `${API_BASE_URL}/users`;

// Activity endpoints
export const ACTIVITY_API = `${API_BASE_URL}/activities`;
export const EMPLOYEE_ACTIVITY_API = `${API_BASE_URL}/employee-activities`;
export const ADMIN_ACTIVITY_API = `${API_BASE_URL}/admin-activities`;

// Time tracking endpoints
export const TIME_TRACKING_API = `${API_BASE_URL}/time-tracking`;
