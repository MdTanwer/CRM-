import mongoose, { Document, Schema } from "mongoose";

export interface IActivity extends Document {
  _id: string;
  message: string;
  type:
    | "employee_added"
    | "employee_deleted"
    | "employee_edited"
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
  timestamp: Date;
  entityId?: string;
  entityType?:
    | "lead"
    | "employee"
    | "call"
    | "profile"
    | "user"
    | "time_tracking";
  userId?: string;
  userName?: string;
  userType?: "admin" | "employee";
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
    [key: string]: any;
  };
  isRead?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
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
        "profile_updated",
        "lead_assigned",
        "lead_status_changed",
        "deal_closed",
        "call_scheduled",
        "lead_created",
        "user_logout",
        "time_entry",
        "auto_checkin",
        "auto_checkout",
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
      enum: ["lead", "employee", "call", "profile", "user", "time_tracking"],
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
      enum: ["admin", "employee"],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for better query performance
activitySchema.index({ timestamp: -1 });
activitySchema.index({ type: 1 });
activitySchema.index({ entityId: 1 });
activitySchema.index({ userId: 1 });
activitySchema.index({ isRead: 1 });

// Virtual for time ago calculation
activitySchema.virtual("timeAgo").get(function () {
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

const Activity = mongoose.model<IActivity>("Activity", activitySchema);

export default Activity;
