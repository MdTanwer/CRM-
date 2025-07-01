// User and Authentication Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId?: string;
  location?: string;
  preferredLanguage?: string;
  role: "admin" | "manager" | "salesperson";
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  location?: string;
  preferredLanguage?: string;
}

// Lead Management Types
export interface Lead {
  id: string;
  contactName: string;
  email: string;
  phone?: string;
  company?: string;
  receivedDate: string;
  status: "ongoing" | "closed" | "unassigned";
  type: "hot" | "warm" | "cold";
  assignedTo?: string;
  assignedToName?: string;
  notes?: string;
  value?: number;
  source?: string;
  hasScheduledCall: boolean;
  nextCallDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFormData {
  contactName: string;
  email: string;
  phone?: string;
  company?: string;
  type: "hot" | "warm" | "cold";
  notes?: string;
  value?: number;
  source?: string;
}

export interface BulkLeadUpload {
  file: File;
  leads: Lead[];
}

// Scheduled Calls Types
export interface ScheduledCall {
  id: string;
  leadId: string;
  leadName: string;
  contactNumber: string;
  scheduledDate: string;
  callType: "referral" | "cold_call" | "follow_up" | "demo";
  status: "scheduled" | "completed" | "missed" | "rescheduled";
  notes?: string;
  duration?: number;
  assignedTo: string;
  assignedToName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CallFormData {
  leadId: string;
  scheduledDate: string;
  callType: "referral" | "cold_call" | "follow_up" | "demo";
  notes?: string;
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: "present" | "absent" | "partial";
  breaks: BreakRecord[];
  totalWorkHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BreakRecord {
  id: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  type: "lunch" | "tea" | "personal" | "other";
  notes?: string;
}

// Activity metadata types
export interface ActivityMetadata {
  leadId?: string;
  employeeId?: string;
  callId?: string;
  dealValue?: number;
  leadCount?: number;
  leadName?: string;
  oldStatus?: string;
  newStatus?: string;
  employeeName?: string;
  totalHours?: number;
  affectedCount?: number;
  backupSize?: string;
  [key: string]: string | number | boolean | undefined;
}

// Employee Activity Types
export type EmployeeActivityType =
  | "profile_updated"
  | "lead_assigned"
  | "lead_status_changed"
  | "deal_closed"
  | "call_scheduled"
  | "lead_created"
  | "user_logout"
  | "time_entry"
  | "auto_checkin"
  | "auto_checkout";

// Admin Activity Types
export type AdminActivityType =
  | "employee_added"
  | "employee_deleted"
  | "employee_edited"
  | "lead_assigned"
  | "lead_status_changed"
  | "deal_closed"
  | "call_scheduled"
  | "lead_created"
  | "user_logout"
  | "system_config_changed"
  | "bulk_lead_upload"
  | "employee_status_changed"
  | "admin_login"
  | "data_export"
  | "system_backup";

// Employee Entity Types
export type EmployeeEntityType =
  | "lead"
  | "call"
  | "profile"
  | "user"
  | "time_tracking";

// Admin Entity Types
export type AdminEntityType =
  | "employee"
  | "lead"
  | "call"
  | "profile"
  | "user"
  | "system";

// Activity Priority Levels
export type ActivityPriority = "low" | "medium" | "high" | "critical";

// Base Activity Interface
export interface BaseActivity {
  id: string;
  userId?: string;
  userName?: string;
  message: string;
  timestamp: string;
  entityId?: string;
  metadata?: ActivityMetadata;
  isRead?: boolean;
}

// Employee Activity Interface
export interface EmployeeActivity extends BaseActivity {
  type: EmployeeActivityType;
  entityType?: EmployeeEntityType;
  userType: "employee";
  userId: string; // Required for employee activities
  userName: string; // Required for employee activities
}

// Admin Activity Interface
export interface AdminActivity extends BaseActivity {
  type: AdminActivityType;
  entityType?: AdminEntityType;
  userType: "admin";
  priority: ActivityPriority;
}

// Legacy Activity Interface (for backward compatibility)
export interface Activity {
  id: string;
  userId: string;
  userName: string;
  type:
    | "lead_assigned"
    | "deal_closed"
    | "call_scheduled"
    | "lead_created"
    | "employee_added";
  description: string;
  entityId?: string;
  entityType?: "lead" | "employee" | "call";
  timestamp: string;
  metadata?: ActivityMetadata;
}

// Union type for all activities
export type AnyActivity = EmployeeActivity | AdminActivity | Activity;

// Dashboard Types
export interface DashboardStats {
  unassignedLeads: number;
  leadsAssignedThisWeek: number;
  activeSalespeople: number;
  conversionRate: number;
  totalLeads: number;
  closedLeads: number;
  totalRevenue?: number;
  avgDealValue?: number;
}

export interface ConversionData {
  date: string;
  conversions: number;
  leads: number;
  rate: number;
}

// Filter and Search Types
export interface LeadFilters {
  status?: "ongoing" | "closed" | "unassigned" | "all";
  type?: "hot" | "warm" | "cold" | "all";
  assignedTo?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
}

export interface CallFilters {
  period: "today" | "upcoming" | "all";
  callType?: "referral" | "cold_call" | "follow_up" | "demo";
  status?: "scheduled" | "completed" | "missed" | "rescheduled";
  assignedTo?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "select"
    | "textarea"
    | "date"
    | "number"
    | "file";
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

// Settings Types
export interface SystemSettings {
  leadAssignment: {
    autoAssign: boolean;
    assignmentMethod: "equal" | "location" | "language" | "manual";
    maxLeadsPerPerson?: number;
  };
  notifications: {
    emailNotifications: boolean;
    callReminders: boolean;
    leadUpdates: boolean;
  };
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: number;
  subItems?: NavItem[];
}

// Component Props Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  width?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  title?: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

// Backend Employee interface from the API
export interface BackendEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  location: string;
  preferredLanguage: string;
  assignedLeads: number;
  closedLeads: number;
  status: "active" | "inactive";
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for dashboard table display
export interface DashboardEmployee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  assignedLeads: number;
  closedLeads: number;
  status: "Active" | "Inactive";
  image?: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  status: "ongoing" | "closed" | "unassigned";
  type: "hot" | "warm" | "cold";
  language: string;
  location: string;
  receivedDate: string;
  assignedEmployee?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
