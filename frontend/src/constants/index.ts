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
  // Legacy types (for backward compatibility)
  LEAD_ASSIGNED: "lead_assigned",
  DEAL_CLOSED: "deal_closed",
  CALL_SCHEDULED: "call_scheduled",
  LEAD_CREATED: "lead_created",
  EMPLOYEE_ADDED: "employee_added",
} as const;

// Employee Activity Types
export const EMPLOYEE_ACTIVITY_TYPES = {
  PROFILE_UPDATED: "profile_updated",
  LEAD_ASSIGNED: "lead_assigned",
  LEAD_STATUS_CHANGED: "lead_status_changed",
  DEAL_CLOSED: "deal_closed",
  CALL_SCHEDULED: "call_scheduled",
  LEAD_CREATED: "lead_created",
  USER_LOGOUT: "user_logout",
  TIME_ENTRY: "time_entry",
  AUTO_CHECKIN: "auto_checkin",
  AUTO_CHECKOUT: "auto_checkout",
} as const;

// Admin Activity Types
export const ADMIN_ACTIVITY_TYPES = {
  EMPLOYEE_ADDED: "employee_added",
  EMPLOYEE_DELETED: "employee_deleted",
  EMPLOYEE_EDITED: "employee_edited",
  LEAD_ASSIGNED: "lead_assigned",
  LEAD_STATUS_CHANGED: "lead_status_changed",
  DEAL_CLOSED: "deal_closed",
  CALL_SCHEDULED: "call_scheduled",
  LEAD_CREATED: "lead_created",
  USER_LOGOUT: "user_logout",
  SYSTEM_CONFIG_CHANGED: "system_config_changed",
  BULK_LEAD_UPLOAD: "bulk_lead_upload",
  EMPLOYEE_STATUS_CHANGED: "employee_status_changed",
  ADMIN_LOGIN: "admin_login",
  DATA_EXPORT: "data_export",
  SYSTEM_BACKUP: "system_backup",
} as const;

// Activity Entity Types
export const EMPLOYEE_ENTITY_TYPES = {
  LEAD: "lead",
  CALL: "call",
  PROFILE: "profile",
  USER: "user",
  TIME_TRACKING: "time_tracking",
} as const;

export const ADMIN_ENTITY_TYPES = {
  EMPLOYEE: "employee",
  LEAD: "lead",
  CALL: "call",
  PROFILE: "profile",
  USER: "user",
  SYSTEM: "system",
} as const;

// Activity Priority Levels (for admin activities)
export const ACTIVITY_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

// Activity Colors by Type
export const ACTIVITY_TYPE_COLORS = {
  // Employee activities
  profile_updated: "#3B82F6", // Blue
  lead_assigned: "#10B981", // Green
  lead_status_changed: "#F59E0B", // Amber
  deal_closed: "#059669", // Emerald
  call_scheduled: "#8B5CF6", // Purple
  lead_created: "#06B6D4", // Cyan
  user_logout: "#6B7280", // Gray
  time_entry: "#84CC16", // Lime
  auto_checkin: "#22C55E", // Green
  auto_checkout: "#EF4444", // Red

  // Admin activities
  employee_added: "#10B981", // Green
  employee_deleted: "#EF4444", // Red
  employee_edited: "#F59E0B", // Amber
  system_config_changed: "#8B5CF6", // Purple
  bulk_lead_upload: "#06B6D4", // Cyan
  employee_status_changed: "#F59E0B", // Amber
  admin_login: "#3B82F6", // Blue
  data_export: "#6366F1", // Indigo
  system_backup: "#84CC16", // Lime
} as const;

// Activity Priority Colors
export const ACTIVITY_PRIORITY_COLORS = {
  low: "#6B7280", // Gray
  medium: "#F59E0B", // Amber
  high: "#EF4444", // Red
  critical: "#DC2626", // Dark Red
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
export const LEAD_SOURCES = {
  WEBSITE: "website",
  REFERRAL: "referral",
  SOCIAL_MEDIA: "social_media",
  EMAIL_CAMPAIGN: "email_campaign",
  COLD_CALL: "cold_call",
  TRADE_SHOW: "trade_show",
  OTHER: "other",
} as const;

// Time Zones (commonly used in CRM systems)
export const TIME_ZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
] as const;

export * from "./routes";
