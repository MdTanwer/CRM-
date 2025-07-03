import mongoose, { Document, Schema } from "mongoose";

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
  | "leads_uploaded"
  | "employee_status_changed"
  | "admin_login"
  | "data_export"
  | "system_backup";

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

// Activity Metadata Interface
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
  updatedFields?: string[];
  socketMessage?: string;
  [key: string]: string | number | boolean | string[] | undefined;
}

// Admin Activity Interface
export interface IAdminActivity extends Document {
  _id: string;
  userId?: string;
  userName?: string;
  type: AdminActivityType;
  message: string;
  entityType?: AdminEntityType;
  entityId?: string;
  priority: ActivityPriority;
  metadata?: ActivityMetadata;
  isRead: boolean;
  userType: "admin";
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Admin Activity Schema
const adminActivitySchema = new Schema<IAdminActivity>(
  {
    userId: {
      type: String,
      default: "admin",
    },
    userName: {
      type: String,
      default: "Admin User",
    },
    type: {
      type: String,
      enum: [
        "employee_added",
        "employee_deleted",
        "employee_edited",
        "lead_assigned",
        "lead_status_changed",
        "deal_closed",
        "call_scheduled",
        "lead_created",
        "user_logout",
        "system_config_changed",
        "bulk_lead_upload",
        "leads_uploaded",
        "employee_status_changed",
        "admin_login",
        "data_export",
        "system_backup",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: ["employee", "lead", "call", "profile", "user", "system"],
    },
    entityId: {
      type: String,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    userType: {
      type: String,
      default: "admin",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "adminactivity", // Specify collection name as 'adminactivity'
  }
);

// Create indexes for better performance
adminActivitySchema.index({ userId: 1, timestamp: -1 });
adminActivitySchema.index({ type: 1, timestamp: -1 });
adminActivitySchema.index({ entityType: 1, entityId: 1 });
adminActivitySchema.index({ isRead: 1, timestamp: -1 });

export const AdminActivity = mongoose.model<IAdminActivity>(
  "AdminActivity",
  adminActivitySchema
);
