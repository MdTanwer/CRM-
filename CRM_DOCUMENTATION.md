# Canova CRM System - Technical Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Core Features](#core-features)
5. [Application Pages](#application-pages)
6. [Database Design](#database-design)
7. [API Documentation](#api-documentation)
8. [Authentication & Authorization](#authentication--authorization)
9. [Real-time Communication](#real-time-communication)
10. [Time Tracking System](#time-tracking-system)
11. [Lead Management](#lead-management)
12. [Employee Activity Tracking](#employee-activity-tracking)
13. [Frontend Architecture](#frontend-architecture)
14. [Deployment & Environment](#deployment--environment)
15. [Development Setup](#development-setup)
16. [Security Considerations](#security-considerations)
17. [Backend Architecture & API Details](#backend-architecture--api-details)

---

## Project Overview

Canova CRM is a comprehensive Customer Relationship Management system designed for sales teams to manage leads, track employee activities, and monitor time tracking. The application provides both admin and employee interfaces with real-time notifications and comprehensive analytics.

### Key Objectives

- **Lead Management**: Efficient lead tracking, assignment, and conversion
- **Time Tracking**: Advanced session-based time tracking with automatic check-in/out
- **Employee Management**: Comprehensive employee lifecycle management
- **Real-time Communication**: Socket.IO-based notifications and updates
- **Activity Monitoring**: Detailed tracking of all system activities
- **Analytics & Reporting**: Data-driven insights for business decisions

---

## System Architecture

### Architecture Pattern

The system follows a **Client-Server Architecture** with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Express.js API │◄──►│   MongoDB       │
│   (Frontend)    │    │   (Backend)     │    │  (Database)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────►│   Socket.IO     │
                        │ (Real-time)     │
                        └─────────────────┘
```

### High-Level Components

1. **Frontend (React + TypeScript)**

   - Modern SPA with React 18
   - TypeScript for type safety
   - Responsive design with Tailwind CSS
   - Real-time updates via Socket.IO

2. **Backend (Node.js + Express)**

   - RESTful API with Express.js
   - TypeScript for backend development
   - JWT-based authentication
   - Real-time communication with Socket.IO

3. **Database (MongoDB)**

   - NoSQL document database
   - Mongoose ODM for data modeling
   - Indexed collections for performance

4. **Real-time Layer (Socket.IO)**
   - Bidirectional event-based communication
   - Real-time notifications
   - Activity broadcasting

---

## Technology Stack

### Backend Technologies

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.1.0
- **Language**: TypeScript 5.8.3
- **Database**: MongoDB with Mongoose 8.16.0
- **Authentication**: JSON Web Tokens (jsonwebtoken 9.0.2)
- **Real-time**: Socket.IO 4.8.1
- **File Processing**: Multer 2.0.1, CSV-Parser 3.2.0
- **Security**: Helmet 8.1.0, bcryptjs 3.0.2
- **Development**: Nodemon 3.1.10, ts-node 10.9.2

### Frontend Technologies

- **Framework**: React 18.2.0
- **Language**: TypeScript 5.2.2
- **Build Tool**: Vite 5.2.0
- **UI Components**: Custom components with Tailwind CSS
- **HTTP Client**: Axios 1.6.8
- **Routing**: React Router DOM 6.30.1
- **Charts**: Recharts 3.0.0
- **Icons**: Lucide React 0.363.0, React Icons 5.5.0
- **Notifications**: React Toastify 11.0.5
- **Date Handling**: date-fns 3.6.0
- **Real-time**: Socket.IO Client 4.8.1

### Database & Storage

- **Primary Database**: MongoDB Atlas
- **ODM**: Mongoose
- **File Storage**: Memory storage (Multer)
- **Session Management**: JWT tokens

---

## Core Features

### 1. User Management

- **Admin Interface**: Complete employee lifecycle management
- **Employee Interface**: Personal dashboard and lead management
- **Authentication**: Email-based login with lastname as password
- **Role-based Access**: Admin and Employee roles with different permissions

### 2. Lead Management

- **Lead CRUD Operations**: Create, read, update, delete leads
- **CSV Import**: Bulk lead upload with intelligent distribution
- **Lead Assignment**: Manual and automatic assignment strategies
- **Lead Status Tracking**: Open, Closed, Ongoing, Pending
- **Lead Types**: Hot, Warm, Cold categorization
- **Search & Filtering**: Advanced search with multiple filters

### 3. Time Tracking

- **Session-based Tracking**: Multiple work sessions per day
- **Auto Check-in/out**: Automatic time tracking on login/logout
- **Break Management**: Start/end break tracking
- **Cross-day Support**: Handle work sessions spanning multiple days
- **Manual Entries**: Support for manual time corrections
- **Comprehensive Reporting**: Daily, weekly, monthly summaries

### 4. Activity Monitoring

- **Employee Activities**: Track lead assignments, deal closures
- **Admin Activities**: Monitor employee management, system changes
- **Real-time Notifications**: Instant activity broadcasting
- **Activity History**: Searchable activity logs

### 5. Scheduling System

- **Call Scheduling**: Schedule calls with leads
- **Conflict Prevention**: Avoid double-booking
- **Calendar Integration**: Date-based schedule management
- **Lead Restrictions**: Prevent closing leads with future calls

---

## Application Pages

### User Interface

#### 1. UserDashboardPage

- **URL Path**: `/dashboard`
- **Primary Purpose**: Main landing page for employees after login
- **Key Components**:
  - Time tracking widget with check-in/check-out functionality
  - Recent activity feed showing the latest 10 activities
  - Current session information with break management
  - Quick statistics about assigned leads and closed deals
  - Real-time notifications for new lead assignments
- **Data Sources**: Time tracking status, employee activities, lead statistics

#### 2. UserLeadsPage

- **URL Path**: `/leads`
- **Primary Purpose**: Manage leads assigned to the current user
- **Key Components**:
  - Filterable and searchable lead list
  - Lead status controls (Open, Ongoing, Pending, Closed)
  - Lead type management (Hot, Warm, Cold)
  - Detailed lead information view
  - Call scheduling interface
- **Data Sources**: User's assigned leads, lead status updates, scheduling data

#### 3. UserSchedulePage

- **URL Path**: `/schedule`
- **Primary Purpose**: Calendar view of scheduled calls and appointments
- **Key Components**:
  - Daily, weekly, and monthly calendar views
  - Upcoming call notifications
  - Call status management (upcoming, completed, cancelled)
  - Notes interface for scheduled calls
  - Validation to prevent closing leads with future calls
- **Data Sources**: User's schedule, lead data, call status updates

#### 4. UserProfilePage

- **URL Path**: `/profile`
- **Primary Purpose**: User profile management
- **Key Components**:
  - Personal information editor
  - Password change functionality
  - Performance statistics display
  - Activity history log
- **Data Sources**: User profile data, authentication system, activity logs

### Admin Interface

#### 1. AdminDashboard

- **URL Path**: `/admin`
- **Primary Purpose**: Central command center for administrators
- **Key Components**:
  - System-wide statistics and metrics
  - Recent activities across the platform
  - Quick access to employee and lead management
  - Real-time notifications for system events
- **Data Sources**: System-wide statistics, admin activities, real-time events

#### 2. EmployeesPage

- **URL Path**: `/admin/employees`
- **Primary Purpose**: Employee management
- **Key Components**:
  - Employee creation, editing, and deletion interface
  - Performance metrics visualization
  - Lead assignment tools
  - Advanced filtering and search
  - Employee status management (active/inactive)
- **Data Sources**: Employee records, performance data, lead assignment data

#### 3. LeadsPage

- **URL Path**: `/admin/leads`
- **Primary Purpose**: Lead management at the administrative level
- **Key Components**:
  - Complete lead listing with advanced filtering
  - CSV import interface with distribution strategy selection
  - Lead assignment controls
  - Status and type management
  - Bulk operations
- **Data Sources**: All leads in the system, employee data for assignments

#### 4. AttendancePage

- **URL Path**: `/admin/attendance`
- **Primary Purpose**: Time tracking and attendance monitoring
- **Key Components**:
  - Daily, weekly, and monthly attendance reports
  - Working hours statistics and visualizations
  - Break time tracking analytics
  - Session management controls
  - Data export functionality
- **Data Sources**: Time tracking records for all employees

#### 5. SettingsPage

- **URL Path**: `/admin/settings`
- **Primary Purpose**: System configuration
- **Key Components**:
  - Admin profile management
  - System parameter configuration
  - Notification settings
  - Backup and restore options
- **Data Sources**: System configuration, admin profile data

### Authentication

#### 1. LoginPage

- **URL Path**: `/login`
- **Primary Purpose**: User authentication
- **Key Components**:
  - Email and password input fields
  - Error handling for invalid credentials
  - Automatic time tracking initiation on successful login
- **Data Sources**: Authentication system, employee records

#### 2. NotFoundPage

- **URL Path**: `*` (any undefined route)
- **Primary Purpose**: Handle navigation to non-existent routes
- **Key Components**:
  - User-friendly error message
  - Navigation back to dashboard
  - Animated illustration
- **Data Sources**: None (static page)

### Page Implementation Details

All pages are built using a component-based architecture:

- **Layout Components**: Header, Sidebar, Footer, etc.
- **Feature Components**: LeadCard, TimeTracker, ActivityFeed, etc.
- **UI Components**: Button, Input, Modal, Dropdown, etc.

State management is handled through:

- **Context API**: Authentication, theme, and global state
- **Local State**: Component-specific state using React hooks
- **Socket Service**: Real-time updates and notifications

---

## Database Design

### Core Collections

#### 1. Users Collection

```typescript
interface IUser {
  _id: ObjectId;
  email: string;
  password: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}
```

---

## API Documentation

### Authentication Endpoints

#### POST /api/v1/auth/login

```json
Request:
{
  "email": "employee@company.com",
  "password": "LastName"
}

Response:
{
  "status": "success",
  "token": "jwt_token_here",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "employee@company.com",
      "role": "user",
      "employeeId": "employee_id",
      "name": "First Last"
    }
  }
}
```

#### GET /api/v1/auth/me

Headers: `Authorization: Bearer <token>`

```json
Response:
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "employee@company.com",
      "role": "user",
      "employeeId": "employee_id",
      "name": "First Last"
    }
  }
}
```

### Lead Management Endpoints

#### GET /api/v1/leads

Query Parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status
- `type`: Filter by type
- `search`: Search term
- `assignedEmployee`: Filter by assigned employee

#### POST /api/v1/leads

```json
Request:
{
  "name": "Lead Name",
  "email": "lead@example.com",
  "phone": "+1234567890",
  "language": "English",
  "location": "Pune",
  "type": "Hot",
  "autoAssign": true
}
```

#### POST /api/v1/leads/upload-csv

Content-Type: `multipart/form-data`

- `file`: CSV file
- `distributionStrategy`: "equal" | "location" | "language" | "smart" | "none"

### Time Tracking Endpoints

#### GET /api/v1/time-tracking/status

Returns current time tracking status for authenticated user.

#### GET /api/v1/time-tracking/history

Query Parameters:

- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `page`: Page number
- `limit`: Items per page

#### POST /api/v1/time-tracking/entry

```json
Request:
{
  "type": "check_in" | "check_out" | "break_start" | "break_end",
  "timestamp": "2024-01-01T09:00:00Z",
  "notes": "Manual entry",
  "sessionNumber": 1
}
```

---

## Backend Architecture & API Details

### Application Structure

The backend follows a **layered architecture** with clear separation of concerns:

```
backend/
├── app.ts                 # Main application entry point
├── models/               # Database models and schemas
│   ├── User.ts
│   ├── Employee.ts
│   ├── Lead.ts
│   ├── TimeTracking.ts
│   ├── EmployeeActivity.ts
│   ├── AdminActivity.ts
│   └── Schedule.ts
├── controller/           # Business logic controllers
│   ├── authController.ts
│   ├── leadController.ts
│   ├── employeeController.ts
│   ├── timeTrackingController.ts
│   └── adminController.ts
├── routes/              # Route definitions
│   ├── authRoutes.ts
│   ├── userRoutes.ts
│   ├── leadRoutes.ts
│   ├── employeeRoutes.ts
│   ├── timeTrackingRoutes.ts
│   └── adminRoutes.ts
├── middleware/          # Custom middleware
│   └── authMiddleware.ts
├── sockets/            # Real-time communication
│   └── socketHandler.ts
├── utils/              # Utility functions
│   ├── database.ts
│   ├── errorHandler.ts
│   └── config.ts
└── package.json
```

### Core Server Setup

#### Express Application Configuration (`app.ts`)

```typescript
import express, { Request, Response, NextFunction } from "express";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./utils/database";
import cors from "cors";
import { globalErrorHandler } from "./utils/errorHandler";
import { initializeSocket } from "./sockets/socketHandler";

// Create Express app
const app = express();
const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

// Initialize Socket.IO handler
initializeSocket(io);

// Middleware configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route mounting
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/leads", leadRoutes);
app.use("/api/v1/time-tracking", timeTrackingRoutes);
app.use("/api/v1/admin", adminRoutes);

// Global error handler
app.use(globalErrorHandler);

// Server startup
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.IO server ready for connections`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
  }
};
```

### Authentication & Authorization Middleware

#### JWT Authentication Middleware (`middleware/authMiddleware.ts`)

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";

const JWT_SECRET = "your-secret-key";

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

// Protect routes middleware
export const protect = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
) => {
  try {
    let token;

    // Extract token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in. Please log in to get access.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists.",
      });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token or token expired. Please log in again.",
    });
  }
};

// Role-based authorization
export const restrictTo = (...roles: string[]) => {
  return (
    req: Request & { user?: IUser },
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in. Please log in to get access.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};
```

### Database Models & Schemas

#### Employee Model (`models/Employee.ts`)

```typescript
import mongoose, { Document, Schema } from "mongoose";

export interface IEmployee extends Document {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  location: "Pune" | "Hyderabad" | "Delhi";
  preferredLanguage: "Hindi" | "English" | "Bengali" | "Tamil";
  status: "active" | "inactive";
  assignedLeads: number;
  closedLeads: number;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
        },
        message: "Please enter a valid email address",
      },
    },
    location: {
      type: String,
      enum: ["Pune", "Hyderabad", "Delhi"],
      required: [true, "Location is required"],
    },
    preferredLanguage: {
      type: String,
      enum: ["Hindi", "English", "Bengali", "Tamil"],
      required: [true, "Preferred language is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    assignedLeads: {
      type: Number,
      default: 0,
    },
    closedLeads: {
      type: Number,
      default: 0,
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
  }
);

// Indexes for performance
employeeSchema.index({ email: 1 });
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ location: 1, preferredLanguage: 1 });

export const Employee = mongoose.model<IEmployee>("Employee", employeeSchema);
```

#### Lead Model (`models/Lead.ts`)

```typescript
import mongoose, { Document, Schema } from "mongoose";

export interface ILead extends Document {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  language: string;
  location: string;
  status: "Open" | "Closed" | "Ongoing" | "Pending";
  type: "Hot" | "Warm" | "Cold";
  receivedDate: Date;
  assignedEmployee?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
      maxlength: [100, "Lead name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          if (!email) return true; // Email is optional
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
        },
        message: "Please enter a valid email address",
      },
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (phone: string) {
          if (!phone) return true; // Phone is optional
          return /^[\+]?[1-9][\d]{0,15}$/.test(phone);
        },
        message: "Please enter a valid phone number",
      },
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      enum: ["Hindi", "English", "Bengali", "Tamil"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      enum: ["Pune", "Hyderabad", "Delhi"],
    },
    status: {
      type: String,
      enum: ["Open", "Closed", "Ongoing", "Pending"],
      default: "Open",
    },
    type: {
      type: String,
      enum: ["Hot", "Warm", "Cold"],
      required: [true, "Lead type is required"],
    },
    receivedDate: {
      type: Date,
      default: Date.now,
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
  }
);

// Compound indexes for efficient queries
leadSchema.index({ status: 1, assignedEmployee: 1 });
leadSchema.index({ location: 1, language: 1 });
leadSchema.index({ type: 1, status: 1 });
leadSchema.index({ receivedDate: -1 });
leadSchema.index({ name: "text", email: "text" });

export const Lead = mongoose.model<ILead>("Lead", leadSchema);
```

### Controller Implementation

#### Lead Controller (`controller/leadController.ts`)

Key functionalities implemented:

1. **CRUD Operations**
2. **CSV Import with Distribution**
3. **Real-time Notifications**
4. **Advanced Filtering**

```typescript
// Get all leads with filtering and pagination
export const getLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      search,
      assignedEmployee,
      location,
      language,
      sortBy = "receivedDate",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter: any = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (assignedEmployee) filter.assignedEmployee = assignedEmployee;
    if (location) filter.location = location;
    if (language) filter.language = language;

    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const pageNumber = parseInt(page as string);
    const pageSize = parseInt(limit as string);
    const skip = (pageNumber - 1) * pageSize;

    // Sort configuration
    const sortConfig: any = {};
    sortConfig[sortBy as string] = sortOrder === "desc" ? -1 : 1;

    // Execute query with population
    const leads = await Lead.find(filter)
      .populate("assignedEmployee", "firstName lastName employeeId")
      .sort(sortConfig)
      .skip(skip)
      .limit(pageSize);

    // Get total count for pagination
    const totalLeads = await Lead.countDocuments(filter);
    const totalPages = Math.ceil(totalLeads / pageSize);

    // Response with metadata
    res.status(200).json({
      status: "success",
      results: leads.length,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalLeads,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
      filters: {
        status,
        type,
        location,
        language,
        search,
        assignedEmployee,
      },
      data: {
        leads,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// CSV Upload with Smart Distribution
export const uploadLeadsCSV = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: "fail",
        message: "Please upload a CSV file",
      });
      return;
    }

    const { distributionStrategy = "none" } = req.body;
    const csvData = req.file.buffer.toString();

    // Parse CSV data
    const results: any[] = [];
    const parser = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    for await (const record of parser) {
      results.push(record);
    }

    if (results.length === 0) {
      res.status(400).json({
        status: "fail",
        message: "CSV file is empty or invalid",
      });
      return;
    }

    // Get active employees for distribution
    const employees = await Employee.find({ status: "active" });

    if (employees.length === 0) {
      res.status(400).json({
        status: "fail",
        message: "No active employees found for lead assignment",
      });
      return;
    }

    // Process leads and assign based on strategy
    const processedLeads = [];
    const employeeAssignments = new Map();
    let successCount = 0;
    let errorCount = 0;

    for (const row of results) {
      try {
        // Normalize field names (case-insensitive)
        const normalizedRow = Object.keys(row).reduce((acc, key) => {
          acc[key.toLowerCase().trim()] = row[key];
          return acc;
        }, {} as any);

        // Create lead data
        const leadData = {
          name: normalizedRow.name || normalizedRow.leadname || "",
          email: normalizedRow.email || "",
          phone: normalizedRow.phone || normalizedRow.mobile || "",
          language: normalizedRow.language || "English",
          location: normalizedRow.location || "Pune",
          type: normalizedRow.type || "Cold",
          status: "Open",
          receivedDate: new Date(),
        };

        // Validate required fields
        if (!leadData.name) {
          errorCount++;
          continue;
        }

        // Assign employee based on strategy
        let assignedEmployee = null;
        if (distributionStrategy !== "none") {
          assignedEmployee = assignEmployeeByStrategy(
            employees,
            leadData,
            distributionStrategy,
            employeeAssignments
          );
        }

        // Create lead
        const lead = await Lead.create({
          ...leadData,
          assignedEmployee: assignedEmployee?._id || null,
        });

        processedLeads.push(lead);
        successCount++;

        // Track assignments for notifications
        if (assignedEmployee) {
          if (!employeeAssignments.has(assignedEmployee._id.toString())) {
            employeeAssignments.set(assignedEmployee._id.toString(), {
              employee: assignedEmployee,
              leadIds: [],
              leadNames: [],
              count: 0,
            });
          }

          const assignment = employeeAssignments.get(
            assignedEmployee._id.toString()
          );
          assignment.leadIds.push(lead._id);
          assignment.leadNames.push(lead.name);
          assignment.count++;
        }
      } catch (leadError) {
        console.error("Error processing lead:", leadError);
        errorCount++;
      }
    }

    // Send notifications to assigned employees
    for (const [employeeId, assignment] of employeeAssignments) {
      try {
        await emitLeadAssigned(
          {
            leadsCount: assignment.count,
            leadIds: assignment.leadIds,
            leadNames: assignment.leadNames,
            assignmentType: "csv_upload",
          },
          {
            employeeId: assignment.employee._id,
            employeeName: `${assignment.employee.firstName} ${assignment.employee.lastName}`,
            employeeEmail: assignment.employee.email,
          },
          {
            adminId: "admin",
            adminName: "Admin User",
          }
        );
      } catch (notificationError) {
        console.error(
          "Failed to send employee notification:",
          notificationError
        );
      }
    }

    // Send admin notification
    try {
      await emitAdminLeadsUploaded(
        {
          totalLeads: successCount,
          assignedLeads: Array.from(employeeAssignments.values()).reduce(
            (sum, assignment) => sum + assignment.count,
            0
          ),
          unassignedLeads:
            successCount -
            Array.from(employeeAssignments.values()).reduce(
              (sum, assignment) => sum + assignment.count,
              0
            ),
          distributionStrategy,
          employeeNotifications: employeeAssignments.size,
        },
        {
          adminId: "admin",
          adminName: "Admin User",
        }
      );
    } catch (adminNotificationError) {
      console.error(
        "Failed to send admin notification:",
        adminNotificationError
      );
    }

    res.status(201).json({
      status: "success",
      message: `Successfully processed ${successCount} leads`,
      data: {
        processed: successCount,
        errors: errorCount,
        total: results.length,
        assigned: Array.from(employeeAssignments.values()).reduce(
          (sum, assignment) => sum + assignment.count,
          0
        ),
        distributionStrategy,
        employeeNotifications: employeeAssignments.size,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Smart assignment function
function assignEmployeeByStrategy(
  employees: any[],
  leadData: any,
  strategy: string,
  currentAssignments: Map<string, any>
): any {
  switch (strategy) {
    case "smart":
      return smartDistribution(employees, leadData, currentAssignments);
    case "equal":
      return equalDistribution(employees, currentAssignments);
    case "location":
      return locationBasedDistribution(employees, leadData, currentAssignments);
    case "language":
      return languageBasedDistribution(employees, leadData, currentAssignments);
    default:
      return null;
  }
}

function smartDistribution(
  employees: any[],
  leadData: any,
  assignments: Map<string, any>
): any {
  // Priority 1: Exact match (location AND language)
  const exactMatches = employees.filter(
    (emp) =>
      emp.location === leadData.location &&
      emp.preferredLanguage === leadData.language
  );

  if (exactMatches.length > 0) {
    return getLeastAssignedEmployee(exactMatches, assignments);
  }

  // Priority 2: Location match
  const locationMatches = employees.filter(
    (emp) => emp.location === leadData.location
  );

  if (locationMatches.length > 0) {
    return getLeastAssignedEmployee(locationMatches, assignments);
  }

  // Priority 3: Language match
  const languageMatches = employees.filter(
    (emp) => emp.preferredLanguage === leadData.language
  );

  if (languageMatches.length > 0) {
    return getLeastAssignedEmployee(languageMatches, assignments);
  }

  // Fallback: Any available employee
  return getLeastAssignedEmployee(employees, assignments);
}

function getLeastAssignedEmployee(
  employees: any[],
  assignments: Map<string, any>
): any {
  return employees.reduce((least, current) => {
    const currentCount = assignments.get(current._id.toString())?.count || 0;
    const leastCount = assignments.get(least._id.toString())?.count || 0;
    return currentCount < leastCount ? current : least;
  });
}
```

### Error Handling

#### Global Error Handler (`utils/errorHandler.ts`)

```typescript
import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

// Development error response
const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Production error response
const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status || "error",
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error("ERROR:", err);

    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

// Handle MongoDB cast errors
const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  const error = new Error(message) as AppError;
  error.statusCode = 400;
  error.status = "fail";
  error.isOperational = true;
  return error;
};

// Handle MongoDB duplicate field errors
const handleDuplicateFieldsDB = (err: any): AppError => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  const error = new Error(message) as AppError;
  error.statusCode = 400;
  error.status = "fail";
  error.isOperational = true;
  return error;
};

// Handle MongoDB validation errors
const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  const error = new Error(message) as AppError;
  error.statusCode = 400;
  error.status = "fail";
  error.isOperational = true;
  return error;
};

// Handle JWT errors
const handleJWTError = (): AppError => {
  const error = new Error("Invalid token. Please log in again!") as AppError;
  error.statusCode = 401;
  error.status = "fail";
  error.isOperational = true;
  return error;
};

const handleJWTExpiredError = (): AppError => {
  const error = new Error(
    "Your token has expired! Please log in again."
  ) as AppError;
  error.statusCode = 401;
  error.status = "fail";
  error.isOperational = true;
  return error;
};

// Global error handling middleware
export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific MongoDB errors
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
```

### API Response Standards

#### Standardized Response Format

All API endpoints follow a consistent response structure:

```typescript
// Success Response
{
  "status": "success",
  "message": "Optional success message",
  "data": {
    "resource": {},
    "meta": {}
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}

// Error Response
{
  "status": "fail" | "error",
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

#### Response Helpers

```typescript
// Success response helper
export const sendSuccessResponse = (
  res: Response,
  data: any,
  message?: string,
  statusCode: number = 200
) => {
  res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

// Error response helper
export const sendErrorResponse = (
  res: Response,
  message: string,
  statusCode: number = 400,
  errors?: any[]
) => {
  res.status(statusCode).json({
    status: statusCode >= 500 ? "error" : "fail",
    message,
    errors,
  });
};

// Pagination helper
export const getPaginationData = (
  page: number,
  limit: number,
  total: number
) => {
  const totalPages = Math.ceil(total / limit);

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
```

### Route Protection & Validation

#### Input Validation Middleware

```typescript
import { body, validationResult } from "express-validator";

// Lead validation rules
export const validateLead = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),

  body("location")
    .isIn(["Pune", "Hyderabad", "Delhi"])
    .withMessage("Location must be Pune, Hyderabad, or Delhi"),

  body("language")
    .isIn(["Hindi", "English", "Bengali", "Tamil"])
    .withMessage("Language must be Hindi, English, Bengali, or Tamil"),

  body("type")
    .isIn(["Hot", "Warm", "Cold"])
    .withMessage("Type must be Hot, Warm, or Cold"),
];

// Validation error handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};
```

### Performance Optimizations

#### Database Indexing Strategy

```typescript
// Compound indexes for efficient queries
leadSchema.index({ status: 1, assignedEmployee: 1 });
leadSchema.index({ location: 1, language: 1 });
leadSchema.index({ type: 1, status: 1 });
leadSchema.index({ receivedDate: -1 });

// Text index for search functionality
leadSchema.index({ name: "text", email: "text" });

// Time tracking optimizations
timeTrackingSchema.index({ userId: 1, date: 1 }, { unique: true });
timeTrackingSchema.index({ date: -1 });
timeTrackingSchema.index({ userId: 1, date: -1 });

// Employee activity indexes
employeeActivitySchema.index({ userId: 1, timestamp: -1 });
employeeActivitySchema.index({ type: 1, timestamp: -1 });
```

#### Query Optimization

```typescript
// Efficient lead queries with population
const leads = await Lead.find(filter)
  .populate("assignedEmployee", "firstName lastName employeeId")
  .select("-__v") // Exclude version field
  .lean() // Return plain objects for better performance
  .sort(sortConfig)
  .skip(skip)
  .limit(pageSize);

// Aggregation pipeline for complex queries
const leadStats = await Lead.aggregate([
  {
    $match: { status: { $ne: "Closed" } },
  },
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 },
      avgAge: {
        $avg: {
          $divide: [{ $subtract: [new Date(), "$receivedDate"] }, 86400000],
        },
      },
    },
  },
  {
    $sort: { count: -1 },
  },
]);
```

---

## Authentication & Authorization

### Authentication Flow

1. **Login Process**:

   - Employee enters email and lastname
   - System validates against Employee collection
   - Creates or updates User record
   - Generates JWT token
   - Auto check-in for time tracking

2. **Token Management**:

   - JWT tokens with 30-day expiry
   - Bearer token authentication
   - Automatic login on valid token

3. **Password System**:
   - Employee's lastname used as password
   - Case-insensitive matching
   - Automatic password updates when lastname changes

### Authorization Levels

- **Public Routes**: Login, API status
- **Authenticated Routes**: All user operations
- **Admin Routes**: Employee management, system administration

---

## Real-time Communication

### Socket.IO Implementation

#### Connection Management

```typescript
// Client-side connection
const socket = io(SOCKET_BASE_URL, {
  transports: ["websocket", "polling"],
  timeout: 20000,
  forceNew: true,
});
```

#### Event Types

1. **Employee Events**:

   - `lead_assigned`: New lead assignments
   - `deal_closed`: Deal closure notifications

2. **Admin Events**:

   - `employee_created`: New employee added
   - `employee_edited`: Employee information updated
   - `employee_deleted`: Employee removed
   - `leads_uploaded`: Bulk lead upload completed

3. **Activity Events**:
   - `activity_update`: General activity updates
   - `employee_activity_update`: Employee-specific activities
   - `admin_activity_update`: Admin-specific activities

#### Event Handling

```typescript
// Server-side event emission
export const emitLeadAssigned = async (
  assignmentData: any,
  employeeInfo: any,
  adminInfo?: any
) => {
  const notification = {
    type: "lead_assigned",
    message: `You have been assigned ${leadsCount} lead(s)`,
    employee: employeeInfo,
    leads: assignmentData,
    timestamp: new Date().toISOString()
  };

  io.emit("lead_assigned", notification);

  // Save to database
  await EmployeeActivity.create({...});
};
```

---

## Time Tracking System

### Session-based Architecture

The time tracking system supports multiple work sessions per day:

1. **Session States**:

   - `new_session`: Ready to start new session
   - `checked_in`: Actively working
   - `on_break`: On break
   - `back_from_break`: Returned from break

2. **Session Workflow**:

   ```
   Check In → Work → Break Start → Break End → Work → Check Out
   ```

3. **Time Calculations**:

   - Work Hours = Total Time - Break Time
   - Break Hours = Sum of all break durations
   - Total Hours = Check Out - Check In

4. **Cross-day Support**:
   - Handles work sessions spanning midnight
   - Automatic adjustments for next-day calculations

### Key Features

- **Automatic Integration**: Login triggers check-in, logout triggers check-out
- **Manual Corrections**: Support for manual time entry adjustments
- **Session Management**: Multiple sessions per day with independent tracking
- **Historical Data**: Complete time tracking history with session breakdown

---

## Lead Management

### Lead Distribution Strategies

#### 1. Smart Distribution

- Matches leads based on language AND location
- Falls back to partial matches (language OR location)
- Balances workload among employees

#### 2. Equal Distribution

- Distributes leads evenly among active employees
- Considers current lead assignments

#### 3. Location-based Distribution

- Assigns leads to employees in same location
- Balanced distribution within location groups

#### 4. Language-based Distribution

- Assigns leads to employees with matching language preference
- Balanced distribution within language groups

### CSV Import Process

1. **File Validation**: Ensures CSV format and required fields
2. **Data Normalization**: Case-insensitive field mapping
3. **Lead Processing**: Creates lead records with assignments
4. **Notification System**: Notifies employees of new assignments
5. **Admin Reporting**: Provides upload summary to admin

### Lead Lifecycle

```
Created → Assigned → Contacted → Qualified → Closed/Lost
```

---

## Employee Activity Tracking

### Activity Types

#### Employee Activities

- **Lead Assignment**: When leads are assigned to employee
- **Deal Closure**: When employee closes a deal

#### Admin Activities

- **Employee Management**: CRUD operations on employees
- **Bulk Operations**: CSV uploads, bulk assignments
- **System Changes**: Configuration updates

### Activity Storage

- **Persistent Storage**: All activities saved to MongoDB
- **Real-time Broadcasting**: Immediate Socket.IO notifications
- **Metadata Tracking**: Detailed context for each activity

### Activity Display

- **Recent Activities**: Last 10 activities on dashboard
- **Time Formatting**: Human-readable timestamps
- **Activity Filtering**: By type, date, user
- **Scrollable Interface**: Infinite scroll for large activity lists

---

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── forms/        # Form components
│   ├── layout/       # Layout components
│   └── features/     # Feature-specific components
├── pages/            # Page components
├── services/         # API services
├── context/          # React contexts
├── hooks/            # Custom hooks
├── types/            # TypeScript definitions
├── utils/            # Utility functions
└── constants/        # Application constants
```

### State Management

- **React Context**: Global state management
- **Local State**: Component-level state with useState
- **Service Layer**: Centralized API communication

### Routing Strategy

- **Admin Routes**: `/` - Dashboard, leads, employees, settings
- **User Routes**: `/user/*` - Employee dashboard, leads, schedule
- **Auth Routes**: `/login` - Authentication

### Real-time Integration

```typescript
// Activity subscription in components
useEffect(() => {
  const unsubscribe = socketService.onActivityUpdate((activity) => {
    setActivities((prev) => [activity, ...prev].slice(0, 10));
  });

  return unsubscribe;
}, []);
```

---

## Deployment & Environment

### Current Deployment

- **Backend**: Deployed on Render.com
- **Database**: MongoDB Atlas
- **Frontend**: Built for production deployment

### Environment Configuration

```typescript
// Backend environment
const JWT_SECRET = "your-secret-key";
const JWT_EXPIRES_IN = "30d";
const MONGO_URI = "mongodb+srv://...";

// Frontend environment
const API_BASE_URL = "https://crm-7l6v.onrender.com/api/v1";
const SOCKET_BASE_URL = "https://crm-7l6v.onrender.com";
```

### Production Considerations

- **Security**: Helmet.js, CORS configuration
- **Performance**: MongoDB indexing, response caching
- **Monitoring**: Error logging, performance tracking
- **Scalability**: Horizontal scaling support

---

## Development Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

```bash
# Backend .env
JWT_SECRET=your-secret-key
MONGO_URI=mongodb://localhost:27017/crm
PORT=3000

# Frontend .env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Development Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run test`: Run tests

---

## Security Considerations

### Data Protection

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Security**: Secure token generation and validation
- **Input Validation**: Express-validator for request validation
- **CORS Configuration**: Controlled cross-origin access

### Access Control

- **Authentication Middleware**: Protected route access
- **Role-based Authorization**: Admin vs. user permissions
- **Route Protection**: Both frontend and backend route guards

### Data Validation

- **Input Sanitization**: Server-side validation
- **Type Safety**: TypeScript for compile-time safety
- **Database Validation**: Mongoose schema validation

### Production Security

- **Helmet.js**: Security headers
- **Rate Limiting**: API request throttling
- **Error Handling**: Secure error responses
- **Logging**: Security event monitoring

---

## Future Enhancements

### Planned Features

1. **Advanced Analytics**: Detailed reporting and dashboards
2. **Mobile Application**: React Native mobile app
3. **Integration APIs**: Third-party CRM integrations
4. **Advanced Scheduling**: Calendar sync, meeting management
5. **Notification System**: Email, SMS, push notifications
6. **Document Management**: File upload and management
7. **Advanced Reporting**: Export capabilities, custom reports
8. **User Permissions**: Granular permission system

### Technical Improvements

1. **Performance Optimization**: Caching, lazy loading
2. **Testing Coverage**: Unit, integration, and E2E tests
3. **DevOps**: CI/CD pipeline, automated deployment
4. **Monitoring**: Application performance monitoring
5. **Security Enhancements**: Advanced authentication methods
6. **Database Optimization**: Query optimization, indexing
7. **API Documentation**: OpenAPI/Swagger documentation

---
