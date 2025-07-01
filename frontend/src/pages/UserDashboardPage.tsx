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
  type Activity as DatabaseActivity,
} from "../services/activities.service";
import userSocketService, {
  type RealtimeActivity,
} from "../services/userSocket.service";
import "../styles/user-dashboard.css";
import { BottomNavigation } from "../components/BottomNavigation";

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

  // Load activities from database
  useEffect(() => {
    const loadActivities = async () => {
      if (!token) return;

      try {
        setActivitiesLoading(true);
        const activities = await getRecentActivities(token, 5);
        const dashboardActivities = activities.map(
          convertDatabaseActivityToDashboard
        );
        setRecentActivity(dashboardActivities);
        console.log("📚 Loaded activities from database:", dashboardActivities);
      } catch (error) {
        console.error("Error loading activities:", error);
        // Don't show error toast as this is not critical
      } finally {
        setActivitiesLoading(false);
      }
    };

    loadActivities();
  }, [token]);

  // Function to refresh activities from database
  const refreshActivities = async () => {
    if (!token) return;

    try {
      setActivitiesLoading(true);
      const activities = await getRecentActivities(token, 5);
      const dashboardActivities = activities.map(
        convertDatabaseActivityToDashboard
      );
      setRecentActivity(dashboardActivities);
      console.log(
        "🔄 Refreshed activities from database:",
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

  // Initialize socket connection
  useEffect(() => {
    if (user && user._id && user.name) {
      console.log("Initializing socket for user:", user);

      // Connect to socket (only if not already connected)
      if (!userSocketService.isConnected()) {
        userSocketService.connect({
          userId: user._id,
          userName: user.name,
          userType: "employee",
        });
        console.log("Connected to socket");
      } else {
        console.log("Socket already connected, reusing existing connection");
      }

      // Subscribe to activity updates
      const unsubscribeActivity = userSocketService.onActivityUpdate(
        (newActivity: RealtimeActivity) => {
          console.log("🚀 Received new activity:", newActivity);

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

          // Add to recent activity (limit to 5 items) - ALWAYS add, regardless of who created it
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

          // Show toast notification ONLY for other employees' activities
          if (
            newActivity.metadata?.employeeId &&
            newActivity.metadata.employeeId !== user._id
          ) {
            console.log("🔔 Showing notification for other employee activity");
            if (newActivity.type === "deal_closed") {
              toast.success(
                `🎉 ${newActivity.metadata.employeeName} closed a deal!`
              );
            } else if (newActivity.type === "lead_status_changed") {
              toast.info(
                `📊 ${newActivity.metadata.employeeName} updated a lead`
              );
            }
          } else {
            console.log(
              "🤐 Not showing notification - same employee or no employeeId (but still adding to activity list)"
            );
          }
        }
      );

      // Subscribe to connection status
      const unsubscribeConnection = userSocketService.onConnectionChange(
        (connected: boolean) => {
          console.log("🔌 Socket connection status changed:", connected);
          setIsSocketConnected(connected);
          if (connected) {
            console.log("✅ Socket connected - UserDashboard");
          } else {
            console.log("❌ Socket disconnected - UserDashboard");
          }
        }
      );

      // Set initial connection status
      const initialStatus = userSocketService.isConnected();
      console.log("🔍 Initial socket status:", initialStatus);
      setIsSocketConnected(initialStatus);

      // Add a test activity after 3 seconds to verify the UI works
      setTimeout(() => {
        console.log("🧪 Adding test activity");
        const testActivity: ActivityItem = {
          id: "test-" + Date.now(),
          message: "Test activity - Socket connection working!",
          time: "Just now",
          type: "lead",
        };
        setRecentActivity((prev) => [testActivity, ...prev].slice(0, 5));
      }, 3000);

      // Cleanup on unmount or user change - ONLY unsubscribe, don't disconnect socket
      return () => {
        console.log(
          "🧹 Cleaning up socket subscriptions (keeping connection alive)"
        );
        unsubscribeActivity();
        unsubscribeConnection();
        // Removed: userSocketService.disconnect(); - Keep socket connected globally
      };
    } else {
      console.log("❌ No user found, skipping socket initialization");
    }
  }, [user]);

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
        <div className="user-name">{user?.name || "User"}</div>
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
            fontSize: "14px",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
            🐛 Debug Info
          </div>
          <div>Socket Connected: {isSocketConnected ? "✅ Yes" : "❌ No"}</div>
          <div>User ID: {user?._id || "Not found"}</div>
          <div>Activities Count: {recentActivity.length}</div>
          <div style={{ marginTop: "10px" }}>
            <button
              onClick={() => {
                console.log("🧪 Manual test activity triggered");
                const testActivity: ActivityItem = {
                  id: "manual-test-" + Date.now(),
                  message: "Manual test - Button clicked!",
                  time: "Just now",
                  type: "deal",
                };
                setRecentActivity((prev) =>
                  [testActivity, ...prev].slice(0, 5)
                );
              }}
              style={{
                padding: "5px 10px",
                marginRight: "10px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Add Test Activity
            </button>
            <button
              onClick={() => {
                console.log("🔄 Reconnecting socket");
                userSocketService.disconnect();
                setTimeout(() => {
                  if (user && user._id && user.name) {
                    userSocketService.connect({
                      userId: user._id,
                      userName: user.name,
                      userType: "employee",
                    });
                  }
                }, 1000);
              }}
              style={{
                padding: "5px 10px",
                marginRight: "10px",
                backgroundColor: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Reconnect Socket
            </button>
            <button
              onClick={() => {
                console.log("🧪 Testing socket emit");
                userSocketService.emitTestEvent();
              }}
              style={{
                padding: "5px 10px",
                marginRight: "10px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Test Socket Emit
            </button>
            <button
              onClick={async () => {
                console.log("🚀 Creating test activity via API");
                try {
                  const response = await fetch(
                    "http://localhost:3000/api/v1/activities",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        message: "Test activity created from frontend",
                        type: "lead_status_changed",
                        entityId: "test-lead-123",
                        entityType: "lead",
                        userId: user?._id || "test-user",
                        userName: user?.name || "Test User",
                        userType: "employee",
                        metadata: {
                          leadName: "Test Lead",
                          newStatus: "Closed",
                          oldStatus: "Open",
                        },
                      }),
                    }
                  );
                  const data = await response.json();
                  console.log("✅ Test activity created:", data);
                } catch (error) {
                  console.error("❌ Error creating test activity:", error);
                }
              }}
              style={{
                padding: "5px 10px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Test Backend Activity
            </button>
            <button
              onClick={async () => {
                console.log("🎯 Simulating lead status change...");
                try {
                  // First find a lead to update
                  const leadsResponse = await fetch(
                    "http://localhost:3000/api/v1/leads?limit=1",
                    {
                      method: "GET",
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                          "token"
                        )}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );

                  if (leadsResponse.ok) {
                    const leadsData = await leadsResponse.json();
                    if (leadsData.data?.leads?.length > 0) {
                      const lead = leadsData.data.leads[0];
                      const newStatus =
                        lead.status === "Closed" ? "Ongoing" : "Closed";

                      console.log(
                        `📊 Updating lead "${lead.name}" from ${lead.status} to ${newStatus}`
                      );

                      // Update the lead status
                      const updateResponse = await fetch(
                        `http://localhost:3000/api/v1/leads/${lead._id}/status`,
                        {
                          method: "PATCH",
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                              "token"
                            )}`,
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ status: newStatus }),
                        }
                      );

                      if (updateResponse.ok) {
                        console.log("✅ Lead status updated successfully");
                        toast.success(
                          `Lead "${lead.name}" status changed to ${newStatus}`
                        );
                      } else {
                        console.error("❌ Failed to update lead status");
                        toast.error("Failed to update lead status");
                      }
                    } else {
                      console.log("❌ No leads found to update");
                      toast.info("No leads available to test with");
                    }
                  }
                } catch (error) {
                  console.error("❌ Error testing lead status change:", error);
                  toast.error("Error testing lead status change");
                }
              }}
              style={{
                padding: "5px 10px",
                marginLeft: "10px",
                backgroundColor: "#8b5cf6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Test Real Lead Update
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
