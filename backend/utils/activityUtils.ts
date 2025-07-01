import { Request } from "express";
import { createAndBroadcastEmployeeActivity } from "../controller/employeeActivityController";
import { createAndBroadcastAdminActivity } from "../controller/adminActivityController";
import { IEmployeeActivity } from "../models/EmployeeActivity";
import { IAdminActivity } from "../models/AdminActivity";

// Type to determine activity data based on user type
export type ActivityData = {
  message: string;
  type: IEmployeeActivity["type"] | IAdminActivity["type"];
  entityId?: string;
  entityType?: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
  priority?: "low" | "medium" | "high" | "critical";
};

// Helper function to create activity based on user type
export const createActivityByUserType = async (
  req: Request,
  userType: "admin" | "employee",
  activityData: ActivityData
) => {
  try {
    if (userType === "employee") {
      // Validate required fields for employee activities
      if (!activityData.userId || !activityData.userName) {
        console.error(
          "Employee activity missing required fields: userId and userName"
        );
        return null;
      }

      const employeeActivityData: Partial<IEmployeeActivity> = {
        ...activityData,
        userType: "employee",
        type: activityData.type as IEmployeeActivity["type"],
      };

      return await createAndBroadcastEmployeeActivity(
        req,
        employeeActivityData
      );
    } else {
      // Admin activity
      const adminActivityData: Partial<IAdminActivity> = {
        ...activityData,
        userType: "admin",
        priority: activityData.priority || "medium",
        type: activityData.type as IAdminActivity["type"],
      };

      return await createAndBroadcastAdminActivity(req, adminActivityData);
    }
  } catch (error) {
    console.error(`Error creating ${userType} activity:`, error);
    return null;
  }
};

// Helper function to determine user type from request/token
export const getUserTypeFromRequest = (
  req: Request
): "admin" | "employee" | null => {
  // This should be implemented based on your authentication system
  // For now, we'll check if there's user info in the request
  const user = (req as any).user; // Assuming you have user info in request after auth middleware

  if (user) {
    return user.role === "admin" ? "admin" : "employee";
  }

  // Fallback: check from request headers or query params
  const userType = req.headers["x-user-type"] || req.query.userType;

  if (userType === "admin" || userType === "employee") {
    return userType;
  }

  return null;
};

// Helper function to get user info from request
export const getUserInfoFromRequest = (
  req: Request
): { userId?: string; userName?: string } => {
  const user = (req as any).user;

  if (user) {
    return {
      userId: user.id || user._id,
      userName: user.name || user.firstName + " " + user.lastName,
    };
  }

  // Fallback: check from request headers
  return {
    userId: req.headers["x-user-id"] as string,
    userName: req.headers["x-user-name"] as string,
  };
};

// Pre-configured activity creators for common activities
export class ActivityCreator {
  private req: Request;
  private userType: "admin" | "employee";
  private userInfo: { userId?: string; userName?: string };

  constructor(req: Request, userType: "admin" | "employee") {
    this.req = req;
    this.userType = userType;
    this.userInfo = getUserInfoFromRequest(req);
  }

  // Employee specific activities
  async createLeadStatusChanged(
    leadId: string,
    leadName: string,
    oldStatus: string,
    newStatus: string
  ) {
    return await createActivityByUserType(this.req, this.userType, {
      message: `Lead status changed from ${oldStatus} to ${newStatus} for ${leadName}`,
      type: "lead_status_changed",
      entityId: leadId,
      entityType: "lead",
      userId: this.userInfo.userId,
      userName: this.userInfo.userName,
      metadata: {
        leadId,
        leadName,
        oldStatus,
        newStatus,
      },
    });
  }

  async createProfileUpdated() {
    return await createActivityByUserType(this.req, this.userType, {
      message: `${this.userInfo.userName} updated their profile`,
      type: "profile_updated",
      entityType: "profile",
      userId: this.userInfo.userId,
      userName: this.userInfo.userName,
    });
  }

  async createTimeEntry(totalHours: number) {
    return await createActivityByUserType(this.req, this.userType, {
      message: `${this.userInfo.userName} logged ${totalHours} hours`,
      type: "time_entry",
      entityType: "time_tracking",
      userId: this.userInfo.userId,
      userName: this.userInfo.userName,
      metadata: {
        totalHours,
      },
    });
  }

  // Admin specific activities
  async createEmployeeAdded(employeeId: string, employeeName: string) {
    return await createActivityByUserType(this.req, this.userType, {
      message: `New employee ${employeeName} added to the system`,
      type: "employee_added",
      entityId: employeeId,
      entityType: "employee",
      userId: this.userInfo.userId,
      userName: this.userInfo.userName,
      metadata: {
        employeeId,
        employeeName,
      },
      priority: "medium",
    });
  }

  async createEmployeeDeleted(employeeId: string, employeeName: string) {
    return await createActivityByUserType(this.req, this.userType, {
      message: `Employee ${employeeName} removed from the system`,
      type: "employee_deleted",
      entityId: employeeId,
      entityType: "employee",
      userId: this.userInfo.userId,
      userName: this.userInfo.userName,
      metadata: {
        employeeId,
        employeeName,
      },
      priority: "high",
    });
  }

  async createBulkLeadUpload(count: number) {
    return await createActivityByUserType(this.req, this.userType, {
      message: `Bulk upload completed: ${count} leads imported`,
      type: "bulk_lead_upload",
      entityType: "lead",
      userId: this.userInfo.userId,
      userName: this.userInfo.userName,
      metadata: {
        affectedCount: count,
      },
      priority: "medium",
    });
  }

  async createSystemBackup(backupSize: string) {
    return await createActivityByUserType(this.req, this.userType, {
      message: `System backup completed (${backupSize})`,
      type: "system_backup",
      entityType: "system",
      userId: this.userInfo.userId,
      userName: this.userInfo.userName,
      metadata: {
        backupSize,
      },
      priority: "low",
    });
  }
}

// Factory function to create ActivityCreator instance
export const createActivityCreator = (
  req: Request,
  userType?: "admin" | "employee"
) => {
  const resolvedUserType =
    userType || getUserTypeFromRequest(req) || "employee";
  return new ActivityCreator(req, resolvedUserType);
};
