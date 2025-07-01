import mongoose, { Document, Schema } from "mongoose";

export interface IAdminActivity extends Document {
  _id: string;
  message: string;
  type:
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
  timestamp: Date;
  entityId?: string;
  entityType?: "lead" | "employee" | "call" | "profile" | "user" | "system";
  userId?: string;
  userName?: string;
  userType: "admin";
  metadata?: {
    employeeName?: string;
    employeeId?: string;
    department?: string;
    leadName?: string;
    leadId?: string;
    assignedTo?: any;
    newStatus?: string;
    oldStatus?: string;
    dealValue?: number;
    callDate?: Date;
    logoutTime?: string;
    userEmail?: string;
    userRole?: string;
    entryType?: string;
    timestamp?: string;
    notes?: string;
    totalHours?: number;
    affectedCount?: number;
    configType?: string;
    exportType?: string;
    backupSize?: string;
    [key: string]: any;
  };
  isRead?: boolean;
  priority?: "low" | "medium" | "high" | "critical";
  createdAt: Date;
  updatedAt: Date;
}

const adminActivitySchema = new Schema<IAdminActivity>(
  {
    message: {
      type: String,
      required: [true, "Activity message is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Activity type is required"],
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
        "employee_status_changed",
        "admin_login",
        "data_export",
        "system_backup",
      ],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    entityId: {
      type: String,
      trim: true,
    },
    entityType: {
      type: String,
      enum: ["lead", "employee", "call", "profile", "user", "system"],
    },
    userId: {
      type: String,
      trim: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    userType: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
  },
  {
    timestamps: true,
    collection: "adminactivity", // Specify custom collection name
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for better query performance
adminActivitySchema.index({ timestamp: -1 });
adminActivitySchema.index({ type: 1 });
adminActivitySchema.index({ entityId: 1 });
adminActivitySchema.index({ userId: 1 });
adminActivitySchema.index({ isRead: 1 });
adminActivitySchema.index({ priority: 1 });
adminActivitySchema.index({ type: 1, timestamp: -1 }); // Compound index for type-based queries

// Virtual for time ago calculation
adminActivitySchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diff = now.getTime() - this.timestamp.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
});

// Static methods for admin-specific queries
adminActivitySchema.statics.findByPriority = function (priority: string) {
  return this.find({ priority }).sort({ timestamp: -1 });
};

adminActivitySchema.statics.findSystemActivities = function () {
  return this.find({
    type: {
      $in: ["system_config_changed", "data_export", "system_backup"],
    },
  }).sort({ timestamp: -1 });
};

adminActivitySchema.statics.findEmployeeManagementActivities = function () {
  return this.find({
    type: {
      $in: [
        "employee_added",
        "employee_deleted",
        "employee_edited",
        "employee_status_changed",
      ],
    },
  }).sort({ timestamp: -1 });
};

adminActivitySchema.statics.findCriticalActivities = function () {
  return this.find({ priority: "critical" }).sort({ timestamp: -1 });
};

const AdminActivity = mongoose.model<IAdminActivity>(
  "AdminActivity",
  adminActivitySchema
);

export default AdminActivity;
