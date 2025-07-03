import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITimeEntry {
  type: "check_in" | "check_out" | "break_start" | "break_end";
  timestamp: Date;
  source: "manual" | "login" | "logout" | "auto";
  notes?: string;
  sessionNumber: number; // Add session number to each entry
}

// New interface for session information
export interface IWorkSession {
  sessionNumber: number;
  checkInTime?: Date;
  breakStartTime?: Date;
  breakEndTime?: Date;
  checkOutTime?: Date;
  workHours: number;
  breakHours: number;
  totalHours: number;
  status: "in_progress" | "completed";
  entries: ITimeEntry[];
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
  status:
    | "checked_in"
    | "checked_out"
    | "on_break"
    | "session_complete"
    | "auto_checkout";
  isCompleted: boolean; // True when the day is considered finished
  currentSessionNumber: number; // Track current session number
  totalSessions: number; // Total number of sessions
  crossDayLogout?: {
    originalLogoutTime: Date;
    adjustedCheckoutTime: Date;
    nextDayCheckInTime: Date;
  };
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  calculateHours(): void;
  getSessionState():
    | "new_session"
    | "checked_in"
    | "on_break"
    | "back_from_break";
  getCurrentSession(): IWorkSession | null;
  getAllSessions(): IWorkSession[];
  getSessionProgress(): { current: number; total: number; status: string };
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
  sessionNumber: {
    type: Number,
    required: true,
    default: 1,
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
      enum: [
        "checked_in",
        "checked_out",
        "on_break",
        "session_complete",
        "auto_checkout",
      ],
      default: "checked_out",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    currentSessionNumber: {
      type: Number,
      default: 1,
    },
    totalSessions: {
      type: Number,
      default: 0,
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

// Method to get current session state based on entries
timeTrackingSchema.methods.getSessionState = function ():
  | "new_session"
  | "checked_in"
  | "on_break"
  | "back_from_break" {
  const currentSessionEntries = this.entries.filter(
    (entry: ITimeEntry) => entry.sessionNumber === this.currentSessionNumber
  );

  const entriesCount = currentSessionEntries.length;

  switch (entriesCount) {
    case 0:
      return "new_session"; // Ready for new session
    case 1:
      return "checked_in"; // After check-in
    case 2:
      return "on_break"; // After break-start
    case 3:
      return "back_from_break"; // After break-end
    default:
      return "new_session"; // Session completed, ready for new one
  }
};

// Method to get current session information
timeTrackingSchema.methods.getCurrentSession =
  function (): IWorkSession | null {
    const currentSessionEntries = this.entries.filter(
      (entry: ITimeEntry) => entry.sessionNumber === this.currentSessionNumber
    );

    if (currentSessionEntries.length === 0) {
      return null;
    }

    const session: IWorkSession = {
      sessionNumber: this.currentSessionNumber,
      workHours: 0,
      breakHours: 0,
      totalHours: 0,
      status: "in_progress",
      entries: currentSessionEntries,
    };

    // Set times based on entries
    currentSessionEntries.forEach((entry: ITimeEntry) => {
      switch (entry.type) {
        case "check_in":
          session.checkInTime = entry.timestamp;
          break;
        case "break_start":
          session.breakStartTime = entry.timestamp;
          break;
        case "break_end":
          session.breakEndTime = entry.timestamp;
          break;
        case "check_out":
          session.checkOutTime = entry.timestamp;
          session.status = "completed";
          break;
      }
    });

    // Calculate hours for current session
    if (session.checkInTime && session.breakStartTime) {
      const workTime1 =
        session.breakStartTime.getTime() - session.checkInTime.getTime();
      session.workHours += workTime1 / (1000 * 60 * 60);
    }

    if (session.breakEndTime && session.checkOutTime) {
      const workTime2 =
        session.checkOutTime.getTime() - session.breakEndTime.getTime();
      session.workHours += workTime2 / (1000 * 60 * 60);
    }

    if (session.breakStartTime && session.breakEndTime) {
      const breakTime =
        session.breakEndTime.getTime() - session.breakStartTime.getTime();
      session.breakHours = breakTime / (1000 * 60 * 60);
    }

    if (session.checkInTime && session.checkOutTime) {
      const totalTime =
        session.checkOutTime.getTime() - session.checkInTime.getTime();
      session.totalHours = totalTime / (1000 * 60 * 60);
    }

    return session;
  };

// Method to get all sessions for the day
timeTrackingSchema.methods.getAllSessions = function (): IWorkSession[] {
  const sessions: IWorkSession[] = [];
  const maxSession = Math.max(
    ...this.entries.map((e: ITimeEntry) => e.sessionNumber),
    0
  );

  for (let sessionNum = 1; sessionNum <= maxSession; sessionNum++) {
    const sessionEntries = this.entries.filter(
      (entry: ITimeEntry) => entry.sessionNumber === sessionNum
    );

    if (sessionEntries.length > 0) {
      const session: IWorkSession = {
        sessionNumber: sessionNum,
        workHours: 0,
        breakHours: 0,
        totalHours: 0,
        status: sessionEntries.length === 4 ? "completed" : "in_progress",
        entries: sessionEntries,
      };

      // Set times and calculate hours
      sessionEntries.forEach((entry: ITimeEntry) => {
        switch (entry.type) {
          case "check_in":
            session.checkInTime = entry.timestamp;
            break;
          case "break_start":
            session.breakStartTime = entry.timestamp;
            break;
          case "break_end":
            session.breakEndTime = entry.timestamp;
            break;
          case "check_out":
            session.checkOutTime = entry.timestamp;
            break;
        }
      });

      // Calculate hours for completed sessions
      if (
        session.checkInTime &&
        session.breakStartTime &&
        session.breakEndTime &&
        session.checkOutTime
      ) {
        const workTime1 =
          session.breakStartTime.getTime() - session.checkInTime.getTime();
        const workTime2 =
          session.checkOutTime.getTime() - session.breakEndTime.getTime();
        const breakTime =
          session.breakEndTime.getTime() - session.breakStartTime.getTime();
        const totalTime =
          session.checkOutTime.getTime() - session.checkInTime.getTime();

        session.workHours = (workTime1 + workTime2) / (1000 * 60 * 60);
        session.breakHours = breakTime / (1000 * 60 * 60);
        session.totalHours = totalTime / (1000 * 60 * 60);
      }

      sessions.push(session);
    }
  }

  return sessions;
};

// Method to get session progress
timeTrackingSchema.methods.getSessionProgress = function (): {
  current: number;
  total: number;
  status: string;
} {
  const sessionState = this.getSessionState();
  const currentSessionEntries = this.entries.filter(
    (entry: ITimeEntry) => entry.sessionNumber === this.currentSessionNumber
  );

  return {
    current: this.currentSessionNumber,
    total: this.totalSessions,
    status: sessionState,
  };
};

// Enhanced method to calculate total hours across all sessions
timeTrackingSchema.methods.calculateHours = function () {
  let totalWork = 0;
  let totalBreak = 0;

  const sessions = this.getAllSessions();

  sessions.forEach((session: IWorkSession) => {
    totalWork += session.workHours;
    totalBreak += session.breakHours;
  });

  this.totalWorkHours = totalWork;
  this.totalBreakHours = totalBreak;

  // Update total sessions count
  this.totalSessions = sessions.filter(
    (s: IWorkSession) => s.status === "completed"
  ).length;
  if (this.getSessionState() !== "new_session") {
    this.totalSessions += 1; // Add current session if in progress
  }
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
      currentSessionNumber: 1,
      totalSessions: 0,
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

  if (
    record &&
    (record.status === "checked_in" || record.status === "on_break")
  ) {
    // End the current session with adjusted time
    const adjustedCheckoutTime = new Date(workDate);
    adjustedCheckoutTime.setHours(23, 59, 59, 999); // End of work day

    // Complete current session
    record.entries.push({
      type: "check_out",
      timestamp: adjustedCheckoutTime,
      source: "auto",
      notes: "Auto checkout due to cross-day logout",
      sessionNumber: record.currentSessionNumber,
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
            sessionNumber: 1,
          },
        ],
        checkInTime: logoutTime,
        status: "checked_in",
        currentSessionNumber: 1,
        totalSessions: 0,
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
