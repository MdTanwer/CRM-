import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  getCurrentTimeStatus,
  getTimeTrackingHistory,
  formatHours,
  getStatusDisplayText,
  type TimeTrackingRecord,
  type TimeEntry,
} from "../services/timeTracking.service";
import "../styles/user-dashboard.css";
import { BottomNavigation } from "../components/BottomNavigation";

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
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // New state variables for session entries
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<string | null>(null);
  const [breakEndTime, setBreakEndTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [currentSessionNumber, setCurrentSessionNumber] = useState<number>(1);

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

        // Extract session entries and times
        if (statusData.timeTracking && statusData.timeTracking.entries) {
          const entries = statusData.timeTracking.entries;
          const currentSession =
            statusData.timeTracking.currentSessionNumber || 1;
          setCurrentSessionNumber(currentSession);

          // Filter entries for current session
          const sessionEntries = entries.filter(
            (entry) => entry.sessionNumber === currentSession
          );

          // Find the latest entry of each type
          const checkIn = findLatestEntryByType(sessionEntries, "check_in");
          const breakStart = findLatestEntryByType(
            sessionEntries,
            "break_start"
          );
          const breakEnd = findLatestEntryByType(sessionEntries, "break_end");
          const checkOut = findLatestEntryByType(sessionEntries, "check_out");

          // Set times in state
          setCheckInTime(checkIn ? formatTime(checkIn.timestamp) : null);
          setBreakStartTime(
            breakStart ? formatTime(breakStart.timestamp) : null
          );
          setBreakEndTime(breakEnd ? formatTime(breakEnd.timestamp) : null);
          setCheckOutTime(checkOut ? formatTime(checkOut.timestamp) : null);
        }

        // Load recent history (last 5 days)
        const historyData = await getTimeTrackingHistory({
          limit: 5,
          page: 1,
        });
        setTimingHistory(historyData.records);
      } catch (error: any) {
        console.error("Error loading time tracking data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTimeTrackingData();
  }, [user]);

  // Helper function to find the latest entry of a specific type
  const findLatestEntryByType = (
    entries: TimeEntry[],
    type: "check_in" | "check_out" | "break_start" | "break_end"
  ): TimeEntry | null => {
    const typeEntries = entries.filter((entry) => entry.type === type);
    if (typeEntries.length === 0) return null;

    // Sort by timestamp (descending) and return the first one
    return typeEntries.sort((a, b) => {
      const dateA = new Date(b.timestamp).getTime();
      const dateB = new Date(a.timestamp).getTime();
      return dateA - dateB;
    })[0];
  };

  const formatTime = (date: Date | string | undefined): string => {
    if (!date) return "--:--";
    try {
      const timeDate = new Date(date);
      return timeDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "--:--";
    }
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

  const getBreakEntries = () => {
    if (!timeTracking?.entries) return [];

    return timeTracking.entries
      .filter(
        (entry) => entry.type === "break_start" || entry.type === "break_end"
      )
      .reduce((acc, entry) => {
        if (entry.type === "break_start") {
          const breakEnd = timeTracking.entries.find(
            (e) =>
              e.type === "break_end" &&
              new Date(e.timestamp) > new Date(entry.timestamp)
          );

          acc.push({
            id:
              entry._id ||
              `break-${entry.sessionNumber}-${new Date(
                entry.timestamp
              ).getTime()}`,
            startTime: formatTime(entry.timestamp),
            endTime: breakEnd ? formatTime(breakEnd.timestamp) : "Ongoing",
            date: formatDate(entry.timestamp),
          });
        }
        return acc;
      }, [] as Array<{ id: string; startTime: string; endTime: string; date: string }>);
  };

  // Get dynamic greeting based on time of day
  const getDynamicGreeting = (): string => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 17) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
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
        <div className="greeting">{getDynamicGreeting()}</div>

        <div className="user-name">{user?.name?.toUpperCase() || ""}</div>
        {/* Socket connection indicator */}
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
            {breakStartTime ? breakStartTime : checkInTime || "--:--"}
          </div>
        </div>
        <div>
          <div className="status-label">Check Out</div>
          <div className="status-time">{checkOutTime || "--:--"}</div>
        </div>

        <div className="toggle-switch-container1"></div>
      </div>

      <div className="timings-section">
        {/* Break Status and Control */}
        <div>
          <div className="timing-status-cards" style={{ margin: "0px" }}>
            <div>
              <div className="status-label">Break </div>
              <div className="status-time">{breakStartTime || "--:--"}</div>
            </div>
            <div>
              <div className="status-label">Ended</div>
              <div className="status-time">{breakEndTime || "--:--"}</div>
            </div>

            <div
              className="toggle-switch-container2"
              style={{
                backgroundColor: breakEndTime ? "#ef4444" : "#10b981",
                width: "20px",
                height: "40px",
                borderRadius: "20px",
              }}
            ></div>
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
        ></div>
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
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
