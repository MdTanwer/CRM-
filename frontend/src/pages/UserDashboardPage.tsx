import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  getCurrentTimeStatus,
  getTimeTrackingHistory,
  createManualTimeEntry,
  formatHours,
  getStatusDisplayText,
  isUserCheckedIn,
  type TimeTrackingRecord,
} from "../services/timeTracking.service";
import {
  getRecentActivities,
  createActivity,
  getUserType,
  type Activity as DatabaseActivity,
  type EmployeeActivityType,
} from "../services/activities.service";
import userSocketService, {
  type RealtimeActivity,
} from "../services/userSocket.service";
import "../styles/user-dashboard.css";
import { BottomNavigation } from "../components/BottomNavigation";
import { useUserType } from "../hooks/useUserType";

interface TimingInfo {
  checkedIn: boolean;
  checkInTime: string | null;
  onBreak: boolean;
  breakStartTime: string | null;
}

interface DashboardStat {
  id: string;
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

interface ActivityItem {
  id: string;
  message: string;
  time: string;
  type: "lead" | "call" | "deal";
}

export const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const {
    userType,
    isAdmin,
    isEmployee,
    isLoading: userTypeLoading,
  } = useUserType();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentStatus, setCurrentStatus] = useState<string>("checked_out");
  const [timeTracking, setTimeTracking] = useState<TimeTrackingRecord | null>(
    null
  );
  const [timingHistory, setTimingHistory] = useState<TimeTrackingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Convert database activity to dashboard activity format
  const convertDatabaseActivityToDashboard = (
    dbActivity: DatabaseActivity
  ): ActivityItem => {
    return {
      id: dbActivity.id,
      message: dbActivity.message,
      time: dbActivity.timeAgo,
      type:
        dbActivity.type === "deal_closed"
          ? "deal"
          : dbActivity.type === "lead_status_changed"
          ? "lead"
          : "call",
    };
  };

  // Load activities from database using new service
  useEffect(() => {
    const loadActivities = async () => {
      if (!token || userTypeLoading) return;

      try {
        setActivitiesLoading(true);
        const activities = await getRecentActivities(token, 5, userType);
        const dashboardActivities = activities.map(
          convertDatabaseActivityToDashboard
        );
        setRecentActivity(dashboardActivities);
        console.log(
          `📚 Loaded ${userType} activities from database:`,
          dashboardActivities
        );
      } catch (error) {
        console.error("Error loading activities:", error);
        // Don't show error toast as this is not critical
      } finally {
        setActivitiesLoading(false);
      }
    };

    loadActivities();
  }, [token, userType, userTypeLoading]);

  // Function to refresh activities from database
  const refreshActivities = async () => {
    if (!token) return;

    try {
      setActivitiesLoading(true);
      const activities = await getRecentActivities(token, 5, userType);
      const dashboardActivities = activities.map(
        convertDatabaseActivityToDashboard
      );
      setRecentActivity(dashboardActivities);
      console.log(
        `🔄 Refreshed ${userType} activities from database:`,
        dashboardActivities
      );
      toast.success("Activities refreshed!");
    } catch (error) {
      console.error("Error refreshing activities:", error);
      toast.error("Failed to refresh activities");
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Initialize socket connection with proper user type
  useEffect(() => {
    if (user && user._id && (user.name || user.email) && !userTypeLoading) {
      console.log(`Initializing socket for ${userType} user:`, user);

      // Connect to socket (only if not already connected)
      if (!userSocketService.isConnected()) {
        userSocketService.connect({
          userId: user._id,
          userName: user.name || user.email,
          userType: userType,
        });
        console.log(`Connected to socket as ${userType}`);
      } else {
        console.log("Socket already connected, reusing existing connection");
      }

      // Subscribe to appropriate activity updates based on user type
      let unsubscribeActivity: (() => void) | undefined;

      if (isEmployee) {
        // Employee users see employee activities
        unsubscribeActivity = userSocketService.onEmployeeActivityUpdate(
          (newActivity: RealtimeActivity) => {
            console.log("🚀 Employee received new activity:", newActivity);
            handleSocketActivity(newActivity);
          }
        );
      } else if (isAdmin) {
        // Admin users see all activities
        unsubscribeActivity = userSocketService.onActivityUpdate(
          (newActivity: RealtimeActivity) => {
            console.log("🚀 Admin received new activity:", newActivity);
            handleSocketActivity(newActivity);
          }
        );
      }

      // Subscribe to connection status
      const unsubscribeConnection = userSocketService.onConnectionChange(
        (connected: boolean) => {
          setIsSocketConnected(connected);
          console.log(`Socket connection status changed: ${connected}`);
        }
      );

      // Initial connection status
      setIsSocketConnected(userSocketService.isConnected());

      // Cleanup function
      return () => {
        if (unsubscribeActivity) unsubscribeActivity();
        unsubscribeConnection();
      };
    }
  }, [user, userType, userTypeLoading, isAdmin, isEmployee]);

  // Handle new activity from socket
  const handleSocketActivity = (newActivity: RealtimeActivity) => {
    // Convert socket activity to dashboard activity format
    const dashboardActivity: ActivityItem = {
      id: newActivity.id,
      message: newActivity.message,
      time: newActivity.timeAgo,
      type:
        newActivity.type === "deal_closed"
          ? "deal"
          : newActivity.type === "lead_status_changed"
          ? "lead"
          : "call",
    };

    console.log("📊 Converted to dashboard activity:", dashboardActivity);

    // Add to recent activity (limit to 5 items)
    setRecentActivity((prev) => {
      console.log("📝 Previous activities:", prev);

      // Check if this activity already exists (to avoid duplicates)
      const exists = prev.some(
        (activity) => activity.id === dashboardActivity.id
      );
      if (exists) {
        console.log("🔄 Activity already exists, skipping duplicate");
        return prev;
      }

      const updated = [dashboardActivity, ...prev].slice(0, 5);
      console.log("✅ Updated activities:", updated);
      return updated;
    });
  };

  // Create test activity using new service
  const createTestActivity = async () => {
    if (!token || !user) return;

    console.log("🚀 Creating test activity via new API");
    console.log("User info:", user);

    try {
      const activityData = {
        message: `Test activity created by ${
          user.name || user.email
        } using new system`,
        type: "lead_status_changed" as EmployeeActivityType,
        entityId: "test-lead-123",
        entityType: "lead" as const,
        metadata: {
          leadName: "Test Lead",
          newStatus: "Closed",
          oldStatus: "Open",
          testCreatedBy: user.name || user.email,
          testTimestamp: new Date().toISOString(),
        },
      };

      const activity = await createActivity(token, activityData, userType);
      console.log("✅ Test activity created:", activity);
      toast.success("Test activity created successfully!");
    } catch (error) {
      console.error("❌ Error creating test activity:", error);
      toast.error("Failed to create test activity");
    }
  };

  // Load time tracking data
  useEffect(() => {
    const loadTimeTrackingData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Load current status
        const statusData = await getCurrentTimeStatus();
        setCurrentStatus(statusData.currentStatus);
        setTimeTracking(statusData.timeTracking);

        // Load recent history (last 5 days)
        const historyData = await getTimeTrackingHistory({
          limit: 5,
          page: 1,
        });
        setTimingHistory(historyData.records);
      } catch (error: any) {
        console.error("Error loading time tracking data:", error);
        toast.error("Failed to load time tracking data");
      } finally {
        setLoading(false);
      }
    };

    loadTimeTrackingData();
  }, [user]);

  const handleManualEntry = async (
    type: "check_in" | "check_out" | "break_start" | "break_end"
  ) => {
    try {
      setActionLoading(true);

      await createManualTimeEntry({
        type,
        notes: `Manual ${type.replace("_", " ")}`,
      });

      // Reload current status
      const statusData = await getCurrentTimeStatus();
      setCurrentStatus(statusData.currentStatus);
      setTimeTracking(statusData.timeTracking);

      // Reload history
      const historyData = await getTimeTrackingHistory({
        limit: 5,
        page: 1,
      });
      setTimingHistory(historyData.records);

      toast.success(`${type.replace("_", " ")} recorded successfully`);
    } catch (error: any) {
      console.error("Error creating manual entry:", error);
      toast.error("Failed to record entry");
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (date: Date | string | undefined): string => {
    if (!date) return "--:--";
    const timeDate = new Date(date);
    return timeDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDisplayTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getCurrentBreakTime = (): string => {
    if (!timeTracking || currentStatus !== "on_break") return "--:--";

    // Find the latest break_start entry
    const breakEntries = timeTracking.entries.filter(
      (e) => e.type === "break_start"
    );
    if (breakEntries.length === 0) return "--:--";

    const latestBreak = breakEntries[breakEntries.length - 1];
    return formatTime(latestBreak.timestamp);
  };

  const getBreakEntries = () => {
    if (!timingHistory || timingHistory.length === 0) return [];

    return timingHistory
      .flatMap((record) =>
        record.entries
          .filter((entry) => entry.type === "break_start")
          .map((entry) => {
            // Find corresponding break_end
            const breakEnd = record.entries.find(
              (endEntry) =>
                endEntry.type === "break_end" &&
                new Date(endEntry.timestamp) > new Date(entry.timestamp)
            );

            return {
              id: `${record._id}-${entry.timestamp}`,
              type: "Break" as const,
              startTime: formatTime(entry.timestamp),
              endTime: breakEnd ? formatTime(breakEnd.timestamp) : "Ongoing",
              date: formatDate(record.date),
            };
          })
      )
      .slice(0, 4); // Show last 4 break entries
  };

  if (loading) {
    return (
      <div className="user-dashboard-container">
        <div className="dashboard-header">
          <div className="brand-logo">
            Canova<span style={{ color: "#E8E000" }}>CRM</span>
          </div>
          <div className="greeting">Loading...</div>
        </div>
        <div style={{ padding: "20px", textAlign: "center" }}>
          Loading time tracking data...
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="user-dashboard-container">
      {/* Header with CanovasCRM branding */}
      <div className="dashboard-header">
        <div className="brand-logo">
          Canova<span style={{ color: "#E8E000" }}>CRM</span>
        </div>
        <div className="greeting">Good Morning</div>
        <div className="user-name">{user?.name || user?.email || "User"}</div>
        {/* Socket connection indicator */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "12px",
            color: isSocketConnected ? "#10b981" : "#ef4444",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: isSocketConnected ? "#10b981" : "#ef4444",
            }}
          ></div>
          {isSocketConnected ? "Live" : "Offline"}
        </div>
      </div>

      {/* Current Time Display */}
      <div className="time-section">
        <div className="current-time">
          <div className="time-display">{formatDisplayTime(currentTime)}</div>
          <div className="date-display">{formatDisplayDate(currentTime)}</div>
        </div>
      </div>

      <div>
        <h3
          style={{
            fontSize: "17px",
            fontWeight: "600",
            marginBottom: "10px",
            marginTop: "20px",
            marginLeft: "25px",
            color: "#0D1829",
          }}
        >
          Timings
        </h3>
      </div>

      <div className="timing-status-cards">
        <div>
          <div className="status-label">Check-in</div>
          <div className="status-time">
            {timeTracking?.checkInTime
              ? formatTime(timeTracking.checkInTime)
              : "--:--"}
          </div>
        </div>
        <div>
          <div className="status-label">Check Out</div>
          <div className="status-time">
            {timeTracking?.checkOutTime
              ? formatTime(timeTracking.checkOutTime)
              : "--:--"}
          </div>
        </div>

        <div className="toggle-switch-container">
          <div
            className={`toggle-switch-pill ${
              isUserCheckedIn(currentStatus) ? "active" : ""
            }`}
            onClick={() => {
              if (actionLoading) return;

              if (currentStatus === "checked_out") {
                handleManualEntry("check_in");
              } else {
                handleManualEntry("check_out");
              }
            }}
            style={{ cursor: actionLoading ? "not-allowed" : "pointer" }}
          >
            <div className="toggle-switch-button"></div>
          </div>
        </div>
      </div>

      <div className="timings-section">
        {/* Break Status and Control */}
        <div>
          <div className="timing-status-cards" style={{ margin: "0px" }}>
            <div>
              <div className="status-label">Break</div>
              <div className="status-time">
                {currentStatus === "on_break" ? getCurrentBreakTime() : "--:--"}
              </div>
            </div>

            <div className="toggle-switch-container">
              <div
                className={`toggle-switch-pill ${
                  currentStatus === "on_break" ? "active" : ""
                }`}
                onClick={() => {
                  if (actionLoading || currentStatus === "checked_out") return;

                  if (currentStatus === "on_break") {
                    handleManualEntry("break_end");
                  } else if (currentStatus === "checked_in") {
                    handleManualEntry("break_start");
                  }
                }}
                style={{
                  cursor:
                    actionLoading || currentStatus === "checked_out"
                      ? "not-allowed"
                      : "pointer",
                  opacity: currentStatus === "checked_out" ? 0.5 : 1,
                }}
              >
                <div className="toggle-switch-button"></div>
              </div>
            </div>
          </div>

          {/* Break History Table */}
          <div className="timing-table">
            {getBreakEntries().map((entry) => (
              <div key={entry.id} className="table-row">
                <div className="cell-group">
                  <div className="row-header">Break</div>
                  <div className="time-cell">{entry.startTime}</div>
                </div>
                <div className="cell-group">
                  <div className="row-header">Ended</div>
                  <div className="time-cell">{entry.endTime}</div>
                </div>
                <div className="cell-group">
                  <div className="row-header">Date</div>
                  <div className="date-cell">{entry.date}</div>
                </div>
              </div>
            ))}
            {getBreakEntries().length === 0 && (
              <div className="table-row">
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#6b7280",
                  }}
                >
                  No break history available
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Debug Section - Remove this in production */}
      {import.meta.env.DEV && (
        <div
          style={{
            margin: "20px 25px",
            padding: "15px",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#374151" }}>
            Debug Info ({userType} mode)
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <button
              onClick={createTestActivity}
              style={{
                padding: "5px 10px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Test New Activity System
            </button>
            <button
              onClick={refreshActivities}
              style={{
                padding: "5px 10px",
                marginLeft: "10px",
                backgroundColor: "#06b6d4",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Refresh Activities
            </button>
          </div>
          <div style={{ marginTop: "10px", color: "#6b7280" }}>
            Socket: {isSocketConnected ? "Connected" : "Disconnected"} | User
            Type: {userType} | Activities: {recentActivity.length}
          </div>
        </div>
      )}

      {/* Status Indicator */}
      {timeTracking && (
        <div
          style={{
            margin: "20px 25px",
            padding: "10px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#374151",
          }}
        >
          <strong>Status:</strong> {getStatusDisplayText(currentStatus)}
          {timeTracking.totalWorkHours > 0 && (
            <span style={{ marginLeft: "10px" }}>
              | Work: {formatHours(timeTracking.totalWorkHours)}
            </span>
          )}
          {timeTracking.totalBreakHours > 0 && (
            <span style={{ marginLeft: "10px" }}>
              | Break: {formatHours(timeTracking.totalBreakHours)}
            </span>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="activity-section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3>Recent Activity</h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "12px",
              color: "#6b7280",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: isSocketConnected ? "#10b981" : "#ef4444",
              }}
            ></div>
            {isSocketConnected ? "Live Updates" : "Offline"}
          </div>
        </div>
        <div className="activity-list">
          {activitiesLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              <div style={{ marginBottom: "8px" }}>Loading activities...</div>
            </div>
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  {activity.time && (
                    <span className="activity-time">{activity.time}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              <div style={{ marginBottom: "8px" }}>No recent activity</div>
              <div style={{ fontSize: "12px" }}>
                {isSocketConnected
                  ? "Activity will appear here when actions are performed"
                  : "Connecting to live updates..."}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
