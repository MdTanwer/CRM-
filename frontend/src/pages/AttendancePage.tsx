import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  getCurrentTimeStatus,
  getTimeTrackingHistory,
  createManualTimeEntry,
  getTimeSummary,
  formatHours,
  getStatusDisplayText,
  getStatusColor,
  isUserCheckedIn,
  type TimeTrackingRecord,
  type TimeSummary,
} from "../services/timeTracking.service";
import "../styles/dashboard.css";
import "../styles/attendance.css";

interface ActivityItem {
  id: string;
  message: string;
  timeAgo: string;
}

export const AttendancePage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const currentPage =
    location.pathname === "/" ? "dashboard" : location.pathname.slice(1);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentStatus, setCurrentStatus] = useState<string>("checked_out");
  const [timeTracking, setTimeTracking] = useState<TimeTrackingRecord | null>(
    null
  );
  const [attendanceHistory, setAttendanceHistory] = useState<
    TimeTrackingRecord[]
  >([]);
  const [weekSummary, setWeekSummary] = useState<TimeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load time tracking data
  useEffect(() => {
    const loadTimeTrackingData = async () => {
      try {
        setLoading(true);

        // Load current status
        const statusData = await getCurrentTimeStatus();
        setCurrentStatus(statusData.currentStatus);
        setTimeTracking(statusData.timeTracking);

        // Load history (last 7 days)
        const historyData = await getTimeTrackingHistory({
          limit: 7,
          page: 1,
        });
        setAttendanceHistory(historyData.records);

        // Load week summary
        const summaryData = await getTimeSummary("week");
        setWeekSummary(summaryData.summary);
      } catch (error: any) {
        console.error("Error loading time tracking data:", error);
        toast.error("Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadTimeTrackingData();
    }
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
        limit: 7,
        page: 1,
      });
      setAttendanceHistory(historyData.records);

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

  const getStatusMessage = (): string => {
    if (!timeTracking) return "No data available";

    switch (currentStatus) {
      case "checked_in":
        return `Checked in at ${formatTime(timeTracking.checkInTime)}`;
      case "on_break":
        return `On break since ${getCurrentBreakTime()}`;
      case "checked_out":
        return timeTracking.checkOutTime
          ? `Checked out at ${formatTime(timeTracking.checkOutTime)}`
          : "Not checked in today";
      case "auto_checkout":
        return `Auto checked out at ${formatTime(timeTracking.checkOutTime)}`;
      default:
        return "Status unknown";
    }
  };

  const recentActivity: ActivityItem[] = [
    {
      id: "1",
      message: "You were assigned 3 more new lead",
      timeAgo: "1 hour ago",
    },
    {
      id: "2",
      message: "You Closed deal today",
      timeAgo: "2 hours ago",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar currentPage={currentPage} />
        <div className="main-content">
          <div className="loading-spinner">Loading attendance data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} />

      <div className="main-content">
        {/* Custom Attendance Header */}
        <div className="header">
          <div className="breadcrumb">
            <span>Home</span>
            <span>&gt;</span>
            <span style={{ color: "#1f2937", fontWeight: "500" }}>
              Attendance Tracking
            </span>
          </div>

          <div className="header-actions">
            <input
              type="date"
              className="date-picker"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
            <button className="attendance-report-btn">
              📊 Generate Report
            </button>
            <button className="team-attendance-btn">👥 Team View</button>
          </div>
        </div>

        <div className="attendance-content">
          <div className="attendance-layout">
            {/* User Profile Section */}
            <div className="user-profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  <div className="avatar-circle-large">
                    {user?.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("") || "U"}
                  </div>
                </div>
                <div className="profile-info">
                  <h2 className="profile-name">{user?.name || "User"}</h2>
                  <p className="profile-role">Employee</p>
                  <div
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(currentStatus),
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      marginTop: "8px",
                    }}
                  >
                    {getStatusDisplayText(currentStatus)}
                  </div>
                </div>
              </div>

              <div className="current-time">
                <div className="time-display">
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </div>
                <div className="date-display">
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              {/* Check In/Out Section */}
              <div className="timing-section">
                <h3>Timings</h3>
                <div className="timing-buttons">
                  {currentStatus === "checked_out" ? (
                    <button
                      className="check-in-btn"
                      onClick={() => handleManualEntry("check_in")}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Processing..." : "Check In"}
                    </button>
                  ) : (
                    <div className="checked-in-info">
                      <span className="check-in-time">
                        {getStatusMessage()}
                      </span>
                      <div className="timing-action-buttons">
                        {currentStatus === "checked_in" && (
                          <>
                            <button
                              className="break-btn"
                              onClick={() => handleManualEntry("break_start")}
                              disabled={actionLoading}
                            >
                              Start Break
                            </button>
                            <button
                              className="check-out-btn"
                              onClick={() => handleManualEntry("check_out")}
                              disabled={actionLoading}
                            >
                              Check Out
                            </button>
                          </>
                        )}
                        {currentStatus === "on_break" && (
                          <>
                            <button
                              className="break-end-btn"
                              onClick={() => handleManualEntry("break_end")}
                              disabled={actionLoading}
                            >
                              End Break
                            </button>
                            <button
                              className="check-out-btn"
                              onClick={() => handleManualEntry("check_out")}
                              disabled={actionLoading}
                            >
                              Check Out
                            </button>
                          </>
                        )}
                        {currentStatus === "auto_checkout" && (
                          <button
                            className="check-in-btn"
                            onClick={() => handleManualEntry("check_in")}
                            disabled={actionLoading}
                          >
                            Check In
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Today's Hours */}
                {timeTracking && (
                  <div className="hours-summary">
                    <div className="hours-item">
                      <span className="hours-label">Work Hours:</span>
                      <span className="hours-value">
                        {formatHours(timeTracking.totalWorkHours)}
                      </span>
                    </div>
                    <div className="hours-item">
                      <span className="hours-label">Break Hours:</span>
                      <span className="hours-value">
                        {formatHours(timeTracking.totalBreakHours)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Records Table */}
            <div className="attendance-table-card">
              <div className="table-header">
                <h3>Recent Attendance</h3>
                {weekSummary && (
                  <div className="week-summary">
                    <span>
                      This Week: {formatHours(weekSummary.totalWorkHours)} total
                    </span>
                  </div>
                )}
              </div>

              <div className="table-container">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Work Hours</th>
                      <th>Break Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map((record) => (
                      <tr key={record._id}>
                        <td>{formatDate(record.date)}</td>
                        <td>{formatTime(record.checkInTime)}</td>
                        <td>{formatTime(record.checkOutTime)}</td>
                        <td>{formatHours(record.totalWorkHours)}</td>
                        <td>{formatHours(record.totalBreakHours)}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: getStatusColor(record.status),
                              color: "white",
                              padding: "2px 6px",
                              borderRadius: "8px",
                              fontSize: "11px",
                            }}
                          >
                            {getStatusDisplayText(record.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="activity-feed-card">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-message">{activity.message}</div>
                    <div className="activity-time">{activity.timeAgo}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
