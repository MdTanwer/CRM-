import { io, Socket } from "socket.io-client";

interface RealtimeActivity {
  id: string;
  message: string;
  timeAgo: string;
  type: string;
  timestamp: string;
  entityId?: string;
  entityType?: string;
  metadata?: any;
  userType?: "admin" | "employee";
  userId?: string;
  userName?: string;
  priority?: "low" | "medium" | "high" | "critical";
}

interface SocketUser {
  userId?: string;
  userName?: string;
  userType?: "admin" | "employee";
}

class SocketService {
  private socket: Socket | null = null;
  private activityCallbacks: Array<(activity: RealtimeActivity) => void> = [];
  private employeeActivityCallbacks: Array<
    (activity: RealtimeActivity) => void
  > = [];
  private adminActivityCallbacks: Array<(activity: RealtimeActivity) => void> =
    [];
  private connectionCallbacks: Array<(connected: boolean) => void> = [];
  private userCountCallbacks: Array<(count: number) => void> = [];

  // Initialize socket connection
  connect(user?: SocketUser): void {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    try {
      this.socket = io("http://localhost:3000", {
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true,
      });

      this.setupEventListeners();

      // Join with user information if provided
      if (user) {
        this.socket.on("connect", () => {
          console.log("Socket connected, joining with user info:", user);
          this.socket?.emit("join", user);
        });
      }
    } catch (error) {
      console.error("Failed to connect to socket:", error);
    }
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      console.log("Disconnecting socket");
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Setup event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("Connected to socket server");
      this.notifyConnectionCallbacks(true);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
      this.notifyConnectionCallbacks(false);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.notifyConnectionCallbacks(false);
    });

    // Legacy activity updates (for backward compatibility)
    this.socket.on("activity_update", (activity: RealtimeActivity) => {
      console.log("Received legacy activity update:", activity);
      this.notifyActivityCallbacks(activity);
    });

    // New separated activity events
    this.socket.on("employee_activity_update", (activity: RealtimeActivity) => {
      console.log("Received employee activity update:", activity);
      // Notify both general and employee-specific callbacks
      this.notifyActivityCallbacks(activity);
      this.notifyEmployeeActivityCallbacks(activity);
    });

    this.socket.on("admin_activity_update", (activity: RealtimeActivity) => {
      console.log("Received admin activity update:", activity);
      // Notify both general and admin-specific callbacks
      this.notifyActivityCallbacks(activity);
      this.notifyAdminActivityCallbacks(activity);
    });

    // User count updates
    this.socket.on("users_count", (count: number) => {
      console.log("Connected users count:", count);
      this.notifyUserCountCallbacks(count);
    });
  }

  // Emit events to server
  emitEmployeeAdded(employeeData: any): void {
    if (this.socket?.connected) {
      console.log("Emitting employee_added event:", employeeData);
      this.socket.emit("employee_added", employeeData);
    }
  }

  emitEmployeeEdited(employeeData: any): void {
    if (this.socket?.connected) {
      console.log("Emitting employee_edited event:", employeeData);
      this.socket.emit("employee_edited", employeeData);
    }
  }

  emitEmployeeDeleted(employeeData: any): void {
    if (this.socket?.connected) {
      console.log("Emitting employee_deleted event:", employeeData);
      this.socket.emit("employee_deleted", employeeData);
    }
  }

  emitProfileUpdated(profileData: any): void {
    if (this.socket?.connected) {
      console.log("Emitting profile_updated event:", profileData);
      this.socket.emit("profile_updated", profileData);
    }
  }

  emitLeadAssigned(leadData: any): void {
    if (this.socket?.connected) {
      console.log("Emitting lead_assigned event:", leadData);
      this.socket.emit("lead_assigned", leadData);
    }
  }

  emitLeadStatusChanged(leadData: any): void {
    if (this.socket?.connected) {
      console.log("Emitting lead_status_changed event:", leadData);
      this.socket.emit("lead_status_changed", leadData);
    }
  }

  emitDealClosed(dealData: any): void {
    if (this.socket?.connected) {
      console.log("Emitting deal_closed event:", dealData);
      this.socket.emit("deal_closed", dealData);
    }
  }

  emitTimeEntry(timeData: any): void {
    if (this.socket?.connected) {
      console.log("Emitting time_entry event:", timeData);
      this.socket.emit("time_entry", timeData);
    }
  }

  emitBulkLeadUpload(uploadData: any): void {
    if (this.socket?.connected) {
      console.log("Emitting bulk_lead_upload event:", uploadData);
      this.socket.emit("bulk_lead_upload", uploadData);
    }
  }

  emitSystemConfigChanged(configData: any): void {
    if (this.socket?.connected) {
      console.log("Emitting system_config_changed event:", configData);
      this.socket.emit("system_config_changed", configData);
    }
  }

  emitCustomActivity(activityData: RealtimeActivity): void {
    if (this.socket?.connected) {
      console.log("Emitting custom activity:", activityData);
      this.socket.emit("new_activity", activityData);
    }
  }

  // Subscribe to activity updates (general)
  onActivityUpdate(callback: (activity: RealtimeActivity) => void): () => void {
    this.activityCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  // Subscribe to employee activity updates
  onEmployeeActivityUpdate(
    callback: (activity: RealtimeActivity) => void
  ): () => void {
    this.employeeActivityCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.employeeActivityCallbacks.indexOf(callback);
      if (index > -1) {
        this.employeeActivityCallbacks.splice(index, 1);
      }
    };
  }

  // Subscribe to admin activity updates
  onAdminActivityUpdate(
    callback: (activity: RealtimeActivity) => void
  ): () => void {
    this.adminActivityCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.adminActivityCallbacks.indexOf(callback);
      if (index > -1) {
        this.adminActivityCallbacks.splice(index, 1);
      }
    };
  }

  // Subscribe to connection status
  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  // Subscribe to user count updates
  onUserCountChange(callback: (count: number) => void): () => void {
    this.userCountCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.userCountCallbacks.indexOf(callback);
      if (index > -1) {
        this.userCountCallbacks.splice(index, 1);
      }
    };
  }

  // Notify activity callbacks
  private notifyActivityCallbacks(activity: RealtimeActivity): void {
    this.activityCallbacks.forEach((callback) => {
      try {
        callback(activity);
      } catch (error) {
        console.error("Error in activity callback:", error);
      }
    });
  }

  // Notify employee activity callbacks
  private notifyEmployeeActivityCallbacks(activity: RealtimeActivity): void {
    this.employeeActivityCallbacks.forEach((callback) => {
      try {
        callback(activity);
      } catch (error) {
        console.error("Error in employee activity callback:", error);
      }
    });
  }

  // Notify admin activity callbacks
  private notifyAdminActivityCallbacks(activity: RealtimeActivity): void {
    this.adminActivityCallbacks.forEach((callback) => {
      try {
        callback(activity);
      } catch (error) {
        console.error("Error in admin activity callback:", error);
      }
    });
  }

  // Notify connection callbacks
  private notifyConnectionCallbacks(connected: boolean): void {
    this.connectionCallbacks.forEach((callback) => {
      try {
        callback(connected);
      } catch (error) {
        console.error("Error in connection callback:", error);
      }
    });
  }

  // Notify user count callbacks
  private notifyUserCountCallbacks(count: number): void {
    this.userCountCallbacks.forEach((callback) => {
      try {
        callback(count);
      } catch (error) {
        console.error("Error in user count callback:", error);
      }
    });
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;

// Export types
export type { RealtimeActivity, SocketUser };
