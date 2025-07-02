import { Server, Socket } from "socket.io";
import { AdminActivity } from "../models/AdminActivity";

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
      type: "employee_edit",
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
