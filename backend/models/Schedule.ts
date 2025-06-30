import mongoose, { Document, Schema } from "mongoose";

export interface ISchedule extends Document {
  leadId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  scheduledDate: string;
  scheduledTime: string;
  status: "upcoming" | "completed" | "cancelled";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "Lead ID is required"],
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee ID is required"],
    },
    scheduledDate: {
      type: String,
      required: [true, "Scheduled date is required"],
    },
    scheduledTime: {
      type: String,
      required: [true, "Scheduled time is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["upcoming", "completed", "cancelled"],
        message: "Status must be upcoming, completed, or cancelled",
      },
      default: "upcoming",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for better query performance
scheduleSchema.index({ employeeId: 1, scheduledDate: 1 });
scheduleSchema.index({ leadId: 1 });
scheduleSchema.index({ status: 1 });
scheduleSchema.index({ createdAt: -1 });

export const Schedule = mongoose.model<ISchedule>("Schedule", scheduleSchema);
