import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITimeEntry {
  type: "check_in" | "check_out" | "break_start" | "break_end";
  timestamp: Date;
  source: "manual" | "login" | "logout" | "auto";
  notes?: string;
}

export interface ITimeTracking extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  date: Date; // The work date (YYYY-MM-DD)
  entries: ITimeEntry[];
  checkInTime?: Date;
  checkOutTime?: Date;
  totalWorkHours: number;
  totalBreakHours: number;
  status: "checked_in" | "checked_out" | "on_break" | "auto_checkout";
  isCompleted: boolean; // True when the day is considered finished
  crossDayLogout?: {
    originalLogoutTime: Date;
    adjustedCheckoutTime: Date;
    nextDayCheckInTime: Date;
  };
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  calculateHours(): void;
}

export interface ITimeTrackingModel extends Model<ITimeTracking> {
  getTodaysRecord(userId: string, employeeId: string): Promise<ITimeTracking>;
  handleCrossDayLogout(
    userId: string,
    employeeId: string,
    logoutTime: Date
  ): Promise<ITimeTracking | null>;
}

const timeEntrySchema = new Schema<ITimeEntry>({
  type: {
    type: String,
    enum: ["check_in", "check_out", "break_start", "break_end"],
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  source: {
    type: String,
    enum: ["manual", "login", "logout", "auto"],
    default: "manual",
  },
  notes: {
    type: String,
    trim: true,
  },
});

const timeTrackingSchema = new Schema<ITimeTracking>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    entries: [timeEntrySchema],
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    totalWorkHours: {
      type: Number,
      default: 0,
    },
    totalBreakHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["checked_in", "checked_out", "on_break", "auto_checkout"],
      default: "checked_out",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    crossDayLogout: {
      originalLogoutTime: Date,
      adjustedCheckoutTime: Date,
      nextDayCheckInTime: Date,
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

// Indexes for efficient queries
timeTrackingSchema.index({ userId: 1, date: 1 }, { unique: true });
timeTrackingSchema.index({ employeeId: 1, date: 1 });
timeTrackingSchema.index({ status: 1 });
timeTrackingSchema.index({ date: -1 });
timeTrackingSchema.index({ createdAt: -1 });

// Method to calculate total hours
timeTrackingSchema.methods.calculateHours = function () {
  let totalWork = 0;
  let totalBreak = 0;
  let currentCheckIn: Date | null = null;
  let currentBreakStart: Date | null = null;

  for (const entry of this.entries) {
    switch (entry.type) {
      case "check_in":
        currentCheckIn = entry.timestamp;
        break;
      case "check_out":
        if (currentCheckIn) {
          const workDuration =
            entry.timestamp.getTime() - currentCheckIn.getTime();
          totalWork += workDuration;
          currentCheckIn = null;
        }
        break;
      case "break_start":
        currentBreakStart = entry.timestamp;
        break;
      case "break_end":
        if (currentBreakStart) {
          const breakDuration =
            entry.timestamp.getTime() - currentBreakStart.getTime();
          totalBreak += breakDuration;
          currentBreakStart = null;
        }
        break;
    }
  }

  // Convert milliseconds to hours
  this.totalWorkHours = totalWork / (1000 * 60 * 60);
  this.totalBreakHours = totalBreak / (1000 * 60 * 60);
};

// Static method to get or create today's record
timeTrackingSchema.statics.getTodaysRecord = async function (
  userId: string,
  employeeId: string
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let record = await this.findOne({ userId, date: today });

  if (!record) {
    record = await this.create({
      userId,
      employeeId,
      date: today,
      entries: [],
      status: "checked_out",
    });
  }

  return record;
};

// Static method to handle cross-day scenarios
timeTrackingSchema.statics.handleCrossDayLogout = async function (
  userId: string,
  employeeId: string,
  logoutTime: Date
) {
  const logoutDate = new Date(logoutTime);
  const workDate = new Date(logoutDate);

  // If logout is after midnight, consider it end of previous day
  if (logoutDate.getHours() < 6) {
    // Before 6 AM considered previous day
    workDate.setDate(workDate.getDate() - 1);
  }

  workDate.setHours(0, 0, 0, 0);

  // Get the work day record
  let record = await this.findOne({ userId, date: workDate });

  if (record && record.status === "checked_in") {
    // End the previous day with adjusted time
    const adjustedCheckoutTime = new Date(workDate);
    adjustedCheckoutTime.setHours(23, 59, 59, 999); // End of work day

    record.entries.push({
      type: "check_out",
      timestamp: adjustedCheckoutTime,
      source: "auto",
      notes: "Auto checkout due to cross-day logout",
    });

    record.checkOutTime = adjustedCheckoutTime;
    record.status = "auto_checkout";
    record.isCompleted = true;
    record.crossDayLogout = {
      originalLogoutTime: logoutTime,
      adjustedCheckoutTime,
      nextDayCheckInTime: logoutTime,
    };

    record.calculateHours();
    await record.save();

    // Create new day record if logout is in new day
    if (logoutDate.getHours() < 6) {
      const newDate = new Date(logoutTime);
      newDate.setHours(0, 0, 0, 0);

      await this.create({
        userId,
        employeeId,
        date: newDate,
        entries: [
          {
            type: "check_in",
            timestamp: logoutTime,
            source: "login",
            notes: "Auto check-in from cross-day scenario",
          },
        ],
        checkInTime: logoutTime,
        status: "checked_in",
      });
    }

    return record;
  }

  return null;
};

export const TimeTracking = mongoose.model<ITimeTracking, ITimeTrackingModel>(
  "TimeTracking",
  timeTrackingSchema
);
