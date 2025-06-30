import mongoose, { Document, Schema } from "mongoose";

export interface IEmployee extends Document {
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
  createdAt: Date;
  updatedAt: Date;
  getFullName(): string;
}

const employeeSchema = new Schema<IEmployee>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
      minlength: [2, "First name must be at least 2 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
      minlength: [2, "Last name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    employeeId: {
      type: String,
      unique: true,
      required: false,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    preferredLanguage: {
      type: String,
      required: [true, "Preferred language is required"],
      trim: true,
    },
    assignedLeads: {
      type: Number,
      default: 0,
    },
    closedLeads: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive"],
        message: "Status must be either active or inactive",
      },
      default: "active",
    },
    avatarUrl: {
      type: String,
      trim: true,
      required: false,
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

// Pre-save middleware to generate employeeId if not provided
employeeSchema.pre("save", async function (next) {
  if (this.isNew && !this.employeeId) {
    try {
      // Generate employee ID with format: EMP + year + random 6-digit number
      let employeeId: string;
      let exists = true;

      do {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        employeeId = `EMP${year}${randomNum}`;

        // Check if this ID already exists
        const existingEmployee = await (this.constructor as any).findOne({
          employeeId,
        });
        exists = !!existingEmployee;
      } while (exists);

      this.employeeId = employeeId;
    } catch (error: any) {
      return next(error);
    }
  }
  next();
});

// Indexes for better query performance
employeeSchema.index({ email: 1 }, { unique: true });
employeeSchema.index({ employeeId: 1 }, { unique: true });
employeeSchema.index({ status: 1 });
employeeSchema.index({ location: 1 });
employeeSchema.index({ preferredLanguage: 1 });
employeeSchema.index({ createdAt: -1 });

// Instance method to get full name
employeeSchema.methods.getFullName = function (): string {
  return `${this.firstName} ${this.lastName}`;
};

// Static method to find active employees
employeeSchema.statics.findActive = function () {
  return this.find({ status: "active" });
};

// Static method to find by location
employeeSchema.statics.findByLocation = function (location: string) {
  return this.find({ location });
};

// Static method to find by language
employeeSchema.statics.findByLanguage = function (language: string) {
  return this.find({ preferredLanguage: language });
};

export const Employee = mongoose.model<IEmployee>("Employee", employeeSchema);
