// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
export const API_TIMEOUT = 10000;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Lead Management
export const LEAD_STATUSES = {
  ONGOING: "ongoing",
  CLOSED: "closed",
  UNASSIGNED: "unassigned",
} as const;

export const LEAD_TYPES = {
  HOT: "hot",
  WARM: "warm",
  COLD: "cold",
} as const;

export const LEAD_STATUS_COLORS = {
  ongoing: "#3B82F6", // Blue
  closed: "#10B981", // Green
  unassigned: "#6B7280", // Gray
};

export const LEAD_TYPE_COLORS = {
  hot: "#EF4444", // Red
  warm: "#F59E0B", // Amber
  cold: "#6366F1", // Indigo
};

// Call Types
export const CALL_TYPES = {
  REFERRAL: "referral",
  COLD_CALL: "cold_call",
  FOLLOW_UP: "follow_up",
  DEMO: "demo",
} as const;

export const CALL_STATUSES = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  MISSED: "missed",
  RESCHEDULED: "rescheduled",
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  SALESPERSON: "salesperson",
} as const;

export const USER_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

// Attendance
export const ATTENDANCE_STATUSES = {
  PRESENT: "present",
  ABSENT: "absent",
  PARTIAL: "partial",
} as const;

export const BREAK_TYPES = {
  LUNCH: "lunch",
  TEA: "tea",
  PERSONAL: "personal",
  OTHER: "other",
} as const;

// Activity Types
export const ACTIVITY_TYPES = {
  LEAD_ASSIGNED: "lead_assigned",
  DEAL_CLOSED: "deal_closed",
  CALL_SCHEDULED: "call_scheduled",
  LEAD_CREATED: "lead_created",
  EMPLOYEE_ADDED: "employee_added",
} as const;

// Navigation Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  LEADS: "/leads",
  LEADS_CREATE: "/leads/create",
  LEADS_EDIT: "/leads/edit/:id",
  LEADS_DETAIL: "/leads/:id",
  SCHEDULE: "/schedule",
  EMPLOYEES: "/employees",
  EMPLOYEES_CREATE: "/employees/create",
  EMPLOYEES_EDIT: "/employees/edit/:id",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  ATTENDANCE: "/attendance",
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
  THEME: "theme",
  LANGUAGE: "language",
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[1-9][\d]{0,15}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "MMM DD, YYYY",
  INPUT: "YYYY-MM-DD",
  DATETIME: "MMM DD, YYYY HH:mm",
  TIME: "HH:mm",
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["text/csv", "application/vnd.ms-excel"],
  MAX_LEADS_PER_UPLOAD: 1000,
} as const;

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: "#3B82F6",
  SECONDARY: "#6B7280",
  SUCCESS: "#10B981",
  WARNING: "#F59E0B",
  ERROR: "#EF4444",
  INFO: "#06B6D4",
} as const;

// Breakpoints (Tailwind CSS)
export const BREAKPOINTS = {
  SM: "640px",
  MD: "768px",
  LG: "1024px",
  XL: "1280px",
  "2XL": "1536px",
} as const;

// Toast Messages
export const TOAST_MESSAGES = {
  LOGIN_SUCCESS: "Successfully logged in!",
  LOGIN_ERROR: "Invalid credentials. Please try again.",
  LOGOUT_SUCCESS: "Successfully logged out!",
  LEAD_CREATED: "Lead created successfully!",
  LEAD_UPDATED: "Lead updated successfully!",
  LEAD_DELETED: "Lead deleted successfully!",
  EMPLOYEE_CREATED: "Employee added successfully!",
  EMPLOYEE_UPDATED: "Employee updated successfully!",
  EMPLOYEE_DELETED: "Employee removed successfully!",
  CALL_SCHEDULED: "Call scheduled successfully!",
  CALL_UPDATED: "Call updated successfully!",
  CHECK_IN_SUCCESS: "Checked in successfully!",
  CHECK_OUT_SUCCESS: "Checked out successfully!",
  BREAK_STARTED: "Break started!",
  BREAK_ENDED: "Break ended!",
  PROFILE_UPDATED: "Profile updated successfully!",
  SETTINGS_SAVED: "Settings saved successfully!",
  FILE_UPLOAD_SUCCESS: "File uploaded successfully!",
  FILE_UPLOAD_ERROR: "Error uploading file. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  GENERIC_ERROR: "Something went wrong. Please try again.",
} as const;

// Dashboard Refresh Intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  DASHBOARD_STATS: 30000, // 30 seconds
  ACTIVITY_FEED: 15000, // 15 seconds
  ATTENDANCE: 60000, // 1 minute
} as const;

// Chart Colors
export const CHART_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
];

// Lead Sources
export const LEAD_SOURCES = [
  "Website",
  "Social Media",
  "Email Campaign",
  "Referral",
  "Cold Call",
  "Trade Show",
  "Partner",
  "Advertisement",
  "Other",
] as const;

// Languages
export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
] as const;

// Timezones (common ones)
export const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
] as const;
