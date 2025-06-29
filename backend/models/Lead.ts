import mongoose, { Document, Schema } from "mongoose";

export interface ILead extends Document {
  name: string;
  email?: string;
  phone?: string;
  receivedDate: Date;
  status: "Open" | "Closed" | "Ongoing" | "Pending";
  type: "Hot" | "Warm" | "Cold";
  language: string;
  location: string;
  assignedEmployee?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (this: ILead, email: string) {
          // Either email or phone must be present
          return !!(email || this.phone);
        },
        message: "Either email or phone must be provided",
      },
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (this: ILead, phone: string) {
          // Either email or phone must be present
          return !!(phone || this.email);
        },
        message: "Either email or phone must be provided",
      },
    },
    receivedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ["Open", "Closed", "Ongoing", "Pending"],
        message: "Status must be Open, Closed, Ongoing, or Pending",
      },
      default: "Open",
    },
    type: {
      type: String,
      enum: {
        values: ["Hot", "Warm", "Cold"],
        message: "Type must be Hot, Warm, or Cold",
      },
      default: "Warm",
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
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
leadSchema.index({ status: 1 });
leadSchema.index({ type: 1 });
leadSchema.index({ language: 1 });
leadSchema.index({ location: 1 });
leadSchema.index({ assignedEmployee: 1 });
leadSchema.index({ createdAt: -1 });

export const Lead = mongoose.model<ILead>("Lead", leadSchema);
