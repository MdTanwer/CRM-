import { io, Socket } from "socket.io-client";
import { SOCKET_BASE_URL } from "../config/api.config";

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
  userId: string;
  userName: string;
  userType: "admin" | "employee";
}

class UserSocketService {
  private socket: Socket | null = null;
  private activityCallbacks: Array<(activity: RealtimeActivity) => void> = [];
  private employeeActivityCallbacks: Array<
    (activity: RealtimeActivity) => void
  > = [];
  private adminActivityCallbacks: Array<(activity: RealtimeActivity) => void> =
    [];
  private connectionCallbacks: Array<(connected: boolean) => void> = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 2000;
  private currentUser: SocketUser | null = null;

  // Initialize socket connection
  connect(token?: string): void {
    if (this.socket?.connected) {
      console.log("🔄 Socket already connected");
      return;
    }

    // Store user for reconnection
    if (token) {
      this.currentUser = {
        userId: token,
        userName: token,
        userType: "employee",
      };
    }

    try {
      console.log("🚀 Connecting to socket server...");
      this.socket = io(SOCKET_BASE_URL, {
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true,
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      this.setupEventListeners();

      // Join with user information if provided
      if (this.currentUser) {
        this.socket.on("connect", () => {
          console.log(
            "✅ Socket connected, joining with user info:",
            this.currentUser
          );
          this.socket?.emit("join", this.currentUser);
          this.reconnectAttempts = 0; // Reset on successful connection
        });
      }
    } catch (error) {
      console.error("❌ Failed to connect to socket:", error);
    }
  }

  // Setup event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    console.log("🎧 Setting up socket event listeners...");

    // Connection events
    this.socket.on("connect", () => {
      console.log("✅ Connected to socket server");
      console.log("📡 Socket ID:", this.socket?.id);
      this.reconnectAttempts = 0;
      this.notifyConnectionCallbacks(true);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from socket server. Reason:", reason);
      this.notifyConnectionCallbacks(false);

      // Attempt reconnection if not a manual disconnect
      if (
        reason !== "io client disconnect" &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        console.log(
          `🔄 Attempting reconnection ${this.reconnectAttempts + 1}/${
            this.maxReconnectAttempts
          }...`
        );
        this.reconnectAttempts++;
        setTimeout(() => {
          if (this.currentUser && !this.socket?.connected) {
            this.connect(this.currentUser?.userId);
          }
        }, this.reconnectInterval);
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("💥 Socket connection error:", error);
      this.notifyConnectionCallbacks(false);
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      if (this.currentUser) {
        this.socket?.emit("join", this.currentUser);
      }
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("💥 Failed to reconnect after maximum attempts");
    });

    // Legacy activity updates (for backward compatibility)
    this.socket.on("activity_update", (activity: RealtimeActivity) => {
      console.log("🎯 LEGACY ACTIVITY_UPDATE RECEIVED:", activity);
      this.notifyActivityCallbacks(activity);
    });

    // New separated activity events
    this.socket.on("employee_activity_update", (activity: RealtimeActivity) => {
      console.log("🎯 EMPLOYEE ACTIVITY_UPDATE RECEIVED:", activity);
      // Notify both general and employee-specific callbacks
      this.notifyActivityCallbacks(activity);
      this.notifyEmployeeActivityCallbacks(activity);
    });

    this.socket.on("admin_activity_update", (activity: RealtimeActivity) => {
      console.log("🎯 ADMIN ACTIVITY_UPDATE RECEIVED:", activity);
      // Notify both general and admin-specific callbacks
      this.notifyActivityCallbacks(activity);
      this.notifyAdminActivityCallbacks(activity);
    });

    // Test event listener
    this.socket.on("test_event", (data) => {
      console.log("🧪 Test event received:", data);
    });

    // Generic listener for all events (debugging)
    this.socket.onAny((eventName, ...args) => {
      console.log(`🔍 Socket event received: ${eventName}`, args);
    });

    // User count updates
    this.socket.on("users_count", (count: number) => {
      console.log("👥 Connected users count:", count);
    });

    console.log("🎧 Event listeners setup complete");
  }

  // Subscribe to activity updates (general)
  onActivityUpdate(callback: (activity: RealtimeActivity) => void): () => void {
    console.log(
      "📝 Subscribing to activity updates. Total callbacks:",
      this.activityCallbacks.length + 1
    );
    this.activityCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
        console.log("🗑️ Unsubscribed from activity updates");
      }
    };
  }

  // Subscribe to employee activity updates
  onEmployeeActivityUpdate(
    callback: (activity: RealtimeActivity) => void
  ): () => void {
    console.log(
      "📝 Subscribing to employee activity updates. Total callbacks:",
      this.employeeActivityCallbacks.length + 1
    );
    this.employeeActivityCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.employeeActivityCallbacks.indexOf(callback);
      if (index > -1) {
        this.employeeActivityCallbacks.splice(index, 1);
        console.log("🗑️ Unsubscribed from employee activity updates");
      }
    };
  }

  // Subscribe to admin activity updates
  onAdminActivityUpdate(
    callback: (activity: RealtimeActivity) => void
  ): () => void {
    console.log(
      "📝 Subscribing to admin activity updates. Total callbacks:",
      this.adminActivityCallbacks.length + 1
    );
    this.adminActivityCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.adminActivityCallbacks.indexOf(callback);
      if (index > -1) {
        this.adminActivityCallbacks.splice(index, 1);
        console.log("🗑️ Unsubscribed from admin activity updates");
      }
    };
  }

  // Subscribe to connection status changes
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

  // Check if socket is connected
  isConnected(): boolean {
    const connected = this.socket?.connected || false;
    console.log("🔍 Socket connection status check:", connected);
    return connected;
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      console.log("🔌 Disconnecting socket...");
      this.currentUser = null; // Clear user to prevent reconnection
      this.reconnectAttempts = 0; // Reset reconnection attempts
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Emit lead status change event
  emitLeadStatusChange(leadData: {
    _id: string;
    name: string;
    status: string;
    oldStatus?: string;
  }): void {
    if (this.socket?.connected) {
      console.log("📤 Emitting lead status change:", leadData);
      this.socket.emit("lead_status_changed", leadData);
    } else {
      console.warn("⚠️ Cannot emit - socket not connected");
    }
  }

  // Emit deal closure event
  emitDealClosed(dealData: {
    employeeName: string;
    value: number;
    leadId: string;
  }): void {
    if (this.socket?.connected) {
      console.log("📤 Emitting deal closed:", dealData);
      this.socket.emit("deal_closed", dealData);
    } else {
      console.warn("⚠️ Cannot emit - socket not connected");
    }
  }

  // Test method to emit a test event
  emitTestEvent(): void {
    if (this.socket?.connected) {
      console.log("🧪 Emitting test event");
      this.socket.emit("test_message", { message: "Hello from frontend!" });
    } else {
      console.warn("⚠️ Cannot emit test - socket not connected");
    }
  }

  // Notify activity callbacks
  private notifyActivityCallbacks(activity: RealtimeActivity): void {
    console.log(
      `📢 Notifying ${this.activityCallbacks.length} activity callbacks...`
    );
    this.activityCallbacks.forEach((callback, index) => {
      try {
        console.log(`📤 Calling callback ${index + 1}...`);
        callback(activity);
      } catch (error) {
        console.error(`💥 Error in activity callback ${index + 1}:`, error);
      }
    });
  }

  // Notify employee activity callbacks
  private notifyEmployeeActivityCallbacks(activity: RealtimeActivity): void {
    console.log(
      `📢 Notifying ${this.employeeActivityCallbacks.length} employee activity callbacks...`
    );
    this.employeeActivityCallbacks.forEach((callback, index) => {
      try {
        console.log(`📤 Calling employee callback ${index + 1}...`);
        callback(activity);
      } catch (error) {
        console.error(
          `💥 Error in employee activity callback ${index + 1}:`,
          error
        );
      }
    });
  }

  // Notify admin activity callbacks
  private notifyAdminActivityCallbacks(activity: RealtimeActivity): void {
    console.log(
      `📢 Notifying ${this.adminActivityCallbacks.length} admin activity callbacks...`
    );
    this.adminActivityCallbacks.forEach((callback, index) => {
      try {
        console.log(`📤 Calling admin callback ${index + 1}...`);
        callback(activity);
      } catch (error) {
        console.error(
          `💥 Error in admin activity callback ${index + 1}:`,
          error
        );
      }
    });
  }

  // Notify connection callbacks
  private notifyConnectionCallbacks(connected: boolean): void {
    console.log(
      `🔔 Notifying ${this.connectionCallbacks.length} connection callbacks with status: ${connected}`
    );
    this.connectionCallbacks.forEach((callback) => {
      try {
        callback(connected);
      } catch (error) {
        console.error("💥 Error in connection callback:", error);
      }
    });
  }
}

// Create singleton instance
const userSocketService = new UserSocketService();

export default userSocketService;
export type { RealtimeActivity, SocketUser };
