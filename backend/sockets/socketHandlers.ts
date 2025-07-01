import { Server, Socket } from "socket.io";

interface ConnectedUser {
  socketId: string;
  userId?: string;
  userName?: string;
  userType?: "admin" | "employee";
  joinedAt: Date;
}

// Store connected users
const connectedUsers = new Map<string, ConnectedUser>();

export const setupSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user joining with their information
    socket.on(
      "join",
      (userData: {
        userId?: string;
        userName?: string;
        userType?: "admin" | "employee";
      }) => {
        const user: ConnectedUser = {
          socketId: socket.id,
          userId: userData.userId,
          userName: userData.userName,
          userType: userData.userType,
          joinedAt: new Date(),
        };

        connectedUsers.set(socket.id, user);

        console.log(`User joined: ${userData.userName} (${userData.userType})`);

        // Send current connected users count to all clients
        io.emit("users_count", connectedUsers.size);
      }
    );

    // Handle activity broadcasting
    socket.on("new_activity", (activityData) => {
      console.log("Broadcasting new activity:", activityData);

      // Broadcast to all connected clients except sender
      socket.broadcast.emit("activity_update", activityData);
    });

    // Handle test messages for debugging
    socket.on("test_message", (data) => {
      console.log("📧 Test message received from frontend:", data);

      // Echo back to all clients
      io.emit("test_event", {
        message: "Test response from backend",
        originalMessage: data.message,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle employee-specific activities
    socket.on("employee_added", (employeeData) => {
      const activityData = {
        id: `activity_${Date.now()}_${Math.random()}`,
        message: `Admin added new employee: ${employeeData.firstName} ${employeeData.lastName}`,
        timeAgo: "Just now",
        type: "employee_added",
        timestamp: new Date().toISOString(),
        entityId: employeeData._id,
        entityType: "employee",
        metadata: {
          employeeName: `${employeeData.firstName} ${employeeData.lastName}`,
          employeeId: employeeData._id,
          department: employeeData.department,
        },
      };

      console.log("Broadcasting employee added activity:", activityData);

      // Broadcast to all connected clients
      io.emit("activity_update", activityData);
    });

    socket.on("employee_edited", (employeeData) => {
      const activityData = {
        id: `activity_${Date.now()}_${Math.random()}`,
        message: `Admin edited employee: ${employeeData.firstName} ${employeeData.lastName}`,
        timeAgo: "Just now",
        type: "employee_edited",
        timestamp: new Date().toISOString(),
        entityId: employeeData._id,
        entityType: "employee",
        metadata: {
          employeeName: `${employeeData.firstName} ${employeeData.lastName}`,
          employeeId: employeeData._id,
          department: employeeData.department,
          updatedFields: employeeData.updatedFields,
        },
      };

      console.log("Broadcasting employee edited activity:", activityData);

      // Broadcast to all connected clients
      io.emit("activity_update", activityData);
    });

    socket.on("profile_updated", (profileData) => {
      const activityData = {
        id: `activity_${Date.now()}_${Math.random()}`,
        message: `Admin updated their profile`,
        timeAgo: "Just now",
        type: "profile_updated",
        timestamp: new Date().toISOString(),
        entityId: profileData.userId || "admin",
        entityType: "profile",
        metadata: {
          profileType: profileData.profileType || "admin",
          userName: profileData.userName,
          originalName: profileData.originalName,
          newName: profileData.newName,
          updatedFields: profileData.updatedFields,
        },
      };

      console.log("Broadcasting profile updated activity:", activityData);

      // Broadcast to all connected clients
      io.emit("activity_update", activityData);
    });

    // Handle lead-specific activities
    socket.on("lead_assigned", (leadData) => {
      const activityData = {
        id: `activity_${Date.now()}_${Math.random()}`,
        message: `Lead "${leadData.name}" was assigned to ${leadData.assignedEmployee?.firstName} ${leadData.assignedEmployee?.lastName}`,
        timeAgo: "Just now",
        type: "lead_assigned",
        timestamp: new Date().toISOString(),
        entityId: leadData._id,
        entityType: "lead",
        metadata: {
          leadName: leadData.name,
          leadId: leadData._id,
          assignedTo: leadData.assignedEmployee,
        },
      };

      console.log("Broadcasting lead assigned activity:", activityData);

      // Broadcast to all connected clients
      io.emit("activity_update", activityData);
    });

    // Handle lead status changes
    socket.on("lead_status_changed", (leadData) => {
      const activityData = {
        id: `activity_${Date.now()}_${Math.random()}`,
        message: `Lead "${leadData.name}" status changed to ${leadData.status}`,
        timeAgo: "Just now",
        type: "lead_status_changed",
        timestamp: new Date().toISOString(),
        entityId: leadData._id,
        entityType: "lead",
        metadata: {
          leadName: leadData.name,
          leadId: leadData._id,
          newStatus: leadData.status,
          oldStatus: leadData.oldStatus,
        },
      };

      console.log("Broadcasting lead status change activity:", activityData);

      // Broadcast to all connected clients
      io.emit("activity_update", activityData);
    });

    // Handle deal closures
    socket.on("deal_closed", (dealData) => {
      const activityData = {
        id: `activity_${Date.now()}_${Math.random()}`,
        message: `${dealData.employeeName} closed a deal worth $${dealData.value}`,
        timeAgo: "Just now",
        type: "deal_closed",
        timestamp: new Date().toISOString(),
        entityId: dealData.leadId,
        entityType: "lead",
        metadata: {
          employeeName: dealData.employeeName,
          dealValue: dealData.value,
          leadId: dealData.leadId,
        },
      };

      console.log("Broadcasting deal closed activity:", activityData);

      // Broadcast to all connected clients
      io.emit("activity_update", activityData);
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        console.log(`User disconnected: ${user.userName} (${socket.id})`);
        connectedUsers.delete(socket.id);

        // Send updated connected users count
        io.emit("users_count", connectedUsers.size);
      }
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  // Utility function to broadcast activity from other parts of the application
  const broadcastActivity = (activityData: any) => {
    io.emit("activity_update", activityData);
  };

  // Make broadcast function available globally
  (global as any).broadcastActivity = broadcastActivity;

  return io;
};
