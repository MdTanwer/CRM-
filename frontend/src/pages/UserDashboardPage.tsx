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

interface TimingEntry {
  id: string;
  type: "Check" | "Break";
  startTime: string;
  endTime: string;
  date: string;
}

export const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentStatus, setCurrentStatus] = useState<string>("checked_out");
  const [timeTracking, setTimeTracking] = useState<TimeTrackingRecord | null>(
    null
  );
  const [timingHistory, setTimingHistory] = useState<TimeTrackingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const recentActivity: ActivityItem[] = [
    {
      id: "1",
      message: "You were assigned 3 more new lead",
      time: "1 hour ago",
      type: "lead",
    },
    {
      id: "2",
      message: "You Closed a deal today",
      time: "2 hours ago",
      type: "deal",
    },
  ];

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
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-content">
                <p className="activity-message">{activity.message}</p>
                {activity.time && (
                  <span className="activity-time">{activity.time}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
