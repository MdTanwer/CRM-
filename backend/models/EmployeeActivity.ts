import mongoose, { Document, Schema } from "mongoose";

export interface IEmployeeActivity extends Document {
  _id: string;
  message: string;
  type:
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
  entityType?: "lead" | "call" | "profile" | "user" | "time_tracking";
  userId: string;
  userName: string;
  userType: "employee";
  metadata?: {
    employeeName?: string;
    employeeId?: string;
    leadName?: string;
    leadId?: string;
    assignedTo?: any;
    newStatus?: string;
    oldStatus?: string;
    dealValue?: number;
    callDate?: Date;
    logoutTime?: string;
    userEmail?: string;
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

const employeeActivitySchema = new Schema<IEmployeeActivity>(
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
      enum: ["lead", "call", "profile", "user", "time_tracking"],
    },
    userId: {
      type: String,
      required: [true, "User ID is required for employee activities"],
      trim: true,
    },
    userName: {
      type: String,
      required: [true, "User name is required for employee activities"],
      trim: true,
    },
    userType: {
      type: String,
      enum: ["employee"],
      default: "employee",
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
    collection: "empactivity", // Specify custom collection name
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for better query performance
employeeActivitySchema.index({ timestamp: -1 });
employeeActivitySchema.index({ type: 1 });
employeeActivitySchema.index({ entityId: 1 });
employeeActivitySchema.index({ userId: 1 });
employeeActivitySchema.index({ isRead: 1 });
employeeActivitySchema.index({ userId: 1, timestamp: -1 }); // Compound index for user activities

// Virtual for time ago calculation
employeeActivitySchema.virtual("timeAgo").get(function () {
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

// Static methods for employee-specific queries
employeeActivitySchema.statics.findByUserId = function (userId: string) {
  return this.find({ userId }).sort({ timestamp: -1 });
};

employeeActivitySchema.statics.findRecentByUserId = function (
  userId: string,
  days: number = 7
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.find({
    userId,
    timestamp: { $gte: startDate },
  }).sort({ timestamp: -1 });
};

const EmployeeActivity = mongoose.model<IEmployeeActivity>(
  "EmployeeActivity",
  employeeActivitySchema
);

export default EmployeeActivity;
