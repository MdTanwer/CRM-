import { Server, Socket } from "socket.io";
import { AdminActivity } from "../models/AdminActivity";
import EmployeeActivity from "../models/EmployeeActivity";

let io: Server;

// Initialize Socket.IO
export const initializeSocket = (socketServer: Server) => {
  io = socketServer;

  io.on("connection", (socket: Socket) => {
    console.log(` User connected: ${socket.id}`);

    // Handle user joining rooms (optional for future use)
    socket.on("join_room", (room: string) => {
      socket.join(room);
      console.log(` User ${socket.id} joined room: ${room}`);
    });

    // Handle user leaving rooms
    socket.on("leave_room", (room: string) => {
      socket.leave(room);
      console.log(`User ${socket.id} left room: ${room}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Get Socket.IO instance
export const getSocketIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO not initialized! Call initializeSocket first.");
  }
  return io;
};

// Emit employee edit notification and save to MongoDB
export const emitEmployeeEdit = async (employeeData: any, adminInfo: any) => {
  const socketMessage = `You edited employee: ${employeeData.firstName} ${employeeData.lastName}`;

  // Emit Socket.IO notification
  if (io) {
    const notification = {
      type: "employee_edited",
      message: socketMessage,
      employee: {
        id: employeeData._id,
        name: `${employeeData.firstName} ${employeeData.lastName}`,
        email: employeeData.email,
        location: employeeData.location,
        preferredLanguage: employeeData.preferredLanguage,
        status: employeeData.status,
      },
      admin: adminInfo,
      timestamp: new Date().toISOString(),
    };

    io.emit("employee_edited", notification);
    console.log(`📡 Employee edit notification sent:`, notification.message);
  } else {
    console.warn("Socket.IO not initialized, skipping emission");
  }

  // Save to MongoDB adminactivity collection
  try {
    await AdminActivity.create({
      type: "employee_edited",
      message: `You edited employee: ${employeeData.firstName} ${employeeData.lastName}`,
      userId: adminInfo.adminId || "admin",
      userName: adminInfo.adminName || "Admin User",
      entityType: "employee",
      entityId: employeeData._id,
      priority: "medium",
      metadata: {
        employeeId: employeeData._id,
        employeeName: `${employeeData.firstName} ${employeeData.lastName}`,
        updatedFields: adminInfo.updatedFields || [],
        socketMessage,
        email: employeeData.email,
        location: employeeData.location,
        preferredLanguage: employeeData.preferredLanguage,
        status: employeeData.status,
      },
      userType: "admin",
      timestamp: new Date(),
    });
    console.log(`💾 Admin activity saved to MongoDB: ${socketMessage}`);
  } catch (dbError) {
    console.error("Failed to save admin activity to MongoDB:", dbError);
  }
};

// Emit employee creation notification and save to MongoDB
export const emitEmployeeCreated = async (
  employeeData: any,
  adminInfo: any
) => {
  const socketMessage = `New employee added: ${employeeData.firstName} ${employeeData.lastName}`;

  // Emit Socket.IO notification
  if (io) {
    const notification = {
      type: "employee_created",
      message: socketMessage,
      employee: {
        id: employeeData._id,
        name: `${employeeData.firstName} ${employeeData.lastName}`,
        email: employeeData.email,
        location: employeeData.location,
        preferredLanguage: employeeData.preferredLanguage,
        status: employeeData.status,
        employeeId: employeeData.employeeId,
      },
      admin: adminInfo,
      timestamp: new Date().toISOString(),
    };

    io.emit("employee_created", notification);
    console.log(
      `📡 Employee creation notification sent:`,
      notification.message
    );
  } else {
    console.warn("Socket.IO not initialized, skipping emission");
  }

  // Save to MongoDB adminactivity collection
  try {
    await AdminActivity.create({
      type: "employee_added",
      message: `you created new employee: ${employeeData.firstName}`,
      userId: adminInfo.adminId || "admin",
      userName: adminInfo.adminName || "Admin User",
      entityType: "employee",
      entityId: employeeData._id,
      priority: "medium",
      metadata: {
        employeeId: employeeData._id,
        employeeName: `${employeeData.firstName} ${employeeData.lastName}`,
        socketMessage,
        email: employeeData.email,
        location: employeeData.location,
        preferredLanguage: employeeData.preferredLanguage,
        employeeIdGenerated: employeeData.employeeId,
      },
      userType: "admin",
      timestamp: new Date(),
    });
    console.log(`💾 Admin activity saved to MongoDB: ${socketMessage}`);
  } catch (dbError) {
    console.error("Failed to save admin activity to MongoDB:", dbError);
  }
};

// Emit employee deletion notification and save to MongoDB
export const emitEmployeeDeleted = async (
  employeeData: any,
  adminInfo: any
) => {
  const socketMessage = `You deleted employee: ${employeeData.name}`;

  // Emit Socket.IO notification
  if (io) {
    const notification = {
      type: "employee_deleted",
      message: socketMessage,
      employee: {
        id: employeeData.id,
        name: employeeData.name,
        email: employeeData.email,
        location: employeeData.location,
      },
      admin: adminInfo,
      timestamp: new Date().toISOString(),
    };

    io.emit("employee_deleted", notification);
    console.log(
      `📡 Employee deletion notification sent:`,
      notification.message
    );
  } else {
    console.warn("Socket.IO not initialized, skipping emission");
  }

  // Save to MongoDB adminactivity collection
  try {
    await AdminActivity.create({
      type: "employee_deleted",
      message: `you deleted employee: ${employeeData.name}`,
      userId: adminInfo.adminId || "admin",
      userName: adminInfo.adminName || "Admin User",
      entityType: "employee",
      entityId: employeeData.id,
      priority: "high",
      metadata: {
        employeeId: employeeData.id,
        employeeName: employeeData.name,
        socketMessage,
        email: employeeData.email,
        location: employeeData.location,
      },
      userType: "admin",
      timestamp: new Date(),
    });
    console.log(`💾 Admin activity saved to MongoDB: ${socketMessage}`);
  } catch (dbError) {
    console.error("Failed to save admin activity to MongoDB:", dbError);
  }
};

// Emit general notification
export const emitNotification = (type: string, message: string, data?: any) => {
  if (!io) {
    console.warn("Socket.IO not initialized, skipping notification emission");
    return;
  }

  const notification = {
    type,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  io.emit("notification", notification);
  console.log(`📡 Notification sent: ${message}`);
};

// Emit deal closed notification and save to EmployeeActivity collection
export const emitDealClosed = async (dealData: any, employeeInfo: any) => {
  const socketMessage = ` you closed a deal: "${dealData.leadName}"`;

  // Emit Socket.IO notification
  if (io) {
    const notification = {
      type: "deal_closed",
      message: socketMessage,
      employee: {
        id: employeeInfo.employeeId,
        name: employeeInfo.employeeName,
      },
      lead: {
        id: dealData.leadId,
        name: dealData.leadName,
      },
      timestamp: new Date().toISOString(),
    };

    io.emit("deal_closed", notification);
    console.log(`📡 Deal closed notification sent:`, notification.message);
  } else {
    console.warn("Socket.IO not initialized, skipping emission");
  }

  // Save to MongoDB employeeactivity collection
  try {
    await EmployeeActivity.create({
      message: socketMessage,
      type: "deal_closed",
      timestamp: new Date(),
      entityId: dealData.leadId,
      entityType: "lead",
      userId: employeeInfo.employeeId,
      userName: employeeInfo.employeeName,
      userType: "employee",
      metadata: {
        employeeName: employeeInfo.employeeName,
        employeeId: employeeInfo.employeeId,
        leadName: dealData.leadName,
        leadId: dealData.leadId,
        dealValue: dealData.dealValue || 0,
        oldStatus: dealData.oldStatus || "",
        newStatus: "Closed",
        socketMessage,
      },
      isRead: false,
    });
    console.log(`💾 Deal closed activity saved to EmployeeActivity collection`);
  } catch (dbError) {
    console.error("Failed to save employee activity to MongoDB:", dbError);
  }
};

// Emit lead assignment notification and save to EmployeeActivity collection
export const emitLeadAssigned = async (
  assignmentData: any,
  employeeInfo: any,
  adminInfo?: any
) => {
  const leadsCount = assignmentData.leadsCount || 1;
  const socketMessage = `You have been assigned ${leadsCount} lead${
    leadsCount > 1 ? "s" : ""
  }`;

  // Emit Socket.IO notification
  if (io) {
    const notification = {
      type: "lead_assigned",
      message: socketMessage,
      employee: {
        id: employeeInfo.employeeId,
        name: employeeInfo.employeeName,
        email: employeeInfo.employeeEmail,
      },
      leads: {
        count: leadsCount,
        leadIds: assignmentData.leadIds || [],
        leadNames: assignmentData.leadNames || [],
      },
      assignedBy: adminInfo || null,
      timestamp: new Date().toISOString(),
    };

    // Emit to specific employee if possible (room-based)
    io.emit("lead_assigned", notification);
    console.log(`📡 Lead assignment notification sent:`, notification.message);
  } else {
    console.warn("Socket.IO not initialized, skipping emission");
  }

  // Save to MongoDB employeeactivity collection
  try {
    await EmployeeActivity.create({
      message: socketMessage,
      type: "lead_assigned",
      timestamp: new Date(),
      entityId:
        assignmentData.leadIds?.[0] || assignmentData.leadId || "multiple",
      entityType: "lead",
      userId: employeeInfo.employeeId,
      userName: employeeInfo.employeeName,
      userType: "employee",
      metadata: {
        employeeName: employeeInfo.employeeName,
        employeeId: employeeInfo.employeeId,
        leadsCount: leadsCount,
        leadIds: assignmentData.leadIds || [],
        leadNames: assignmentData.leadNames || [],
        assignmentType: assignmentData.assignmentType || "manual",
        assignedBy: adminInfo?.adminId || "system",
        assignedByName: adminInfo?.adminName || "System",
        socketMessage,
        timestamp: new Date().toISOString(),
      },
      isRead: false,
    });
    console.log(
      `💾 Lead assignment activity saved to EmployeeActivity collection`
    );
  } catch (dbError) {
    console.error(
      "Failed to save lead assignment activity to MongoDB:",
      dbError
    );
  }
};

// Emit admin lead upload notification and save to AdminActivity collection
export const emitAdminLeadsUploaded = async (
  uploadData: any,
  adminInfo?: any
) => {
  const leadsCount = uploadData.totalLeads || 0;
  const socketMessage = `You added ${leadsCount} lead${
    leadsCount > 1 ? "s" : ""
  }`;

  // Emit Socket.IO notification
  if (io) {
    const notification = {
      type: "leads_uploaded",
      message: socketMessage,
      admin: adminInfo || { adminId: "admin", adminName: "Admin User" },
      leads: {
        count: leadsCount,
        assigned: uploadData.assignedLeads || 0,
        unassigned: uploadData.unassignedLeads || 0,
        distributionStrategy: uploadData.distributionStrategy || "none",
      },
      timestamp: new Date().toISOString(),
    };

    io.emit("admin_leads_uploaded", notification);
    console.log(
      `📡 Admin leads upload notification sent:`,
      notification.message
    );
  } else {
    console.warn("Socket.IO not initialized, skipping emission");
  }

  // Save to MongoDB adminactivity collection
  try {
    await AdminActivity.create({
      type: "leads_uploaded",
      message: socketMessage,
      userId: adminInfo?.adminId || "admin",
      userName: adminInfo?.adminName || "Admin User",
      entityType: "lead",
      entityId: "bulk_upload",
      priority: "medium",
      metadata: {
        totalLeads: leadsCount,
        assignedLeads: uploadData.assignedLeads || 0,
        unassignedLeads: uploadData.unassignedLeads || 0,
        distributionStrategy: uploadData.distributionStrategy || "none",
        employeeNotifications: uploadData.employeeNotifications || 0,
        socketMessage,
        uploadTimestamp: new Date().toISOString(),
      },
      userType: "admin",
      timestamp: new Date(),
    });
    console.log(
      `💾 Admin leads upload activity saved to MongoDB: ${socketMessage}`
    );
  } catch (dbError) {
    console.error(
      "Failed to save admin leads upload activity to MongoDB:",
      dbError
    );
  }
};
