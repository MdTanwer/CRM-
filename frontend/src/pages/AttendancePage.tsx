import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import "../styles/dashboard.css";
import "../styles/attendance.css";

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  breakStart: string;
  breakEnd: string;
  totalHours: string;
}

interface ActivityItem {
  id: string;
  message: string;
  timeAgo: string;
}

export const AttendancePage: React.FC = () => {
  const location = useLocation();
  const currentPage =
    location.pathname === "/" ? "dashboard" : location.pathname.slice(1);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<string | null>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const attendanceRecords: AttendanceRecord[] = [
    {
      id: "1",
      date: "09/04/25",
      checkIn: "09:15 am",
      checkOut: "06:20 PM",
      breakStart: "01:00 PM",
      breakEnd: "02:00 PM",
      totalHours: "8h 5m",
    },
    {
      id: "2",
      date: "09/03/25",
      checkIn: "09:10 am",
      checkOut: "06:15 PM",
      breakStart: "01:00 PM",
      breakEnd: "02:00 PM",
      totalHours: "8h 5m",
    },
    {
      id: "3",
      date: "09/02/25",
      checkIn: "09:05 am",
      checkOut: "06:10 PM",
      breakStart: "01:00 PM",
      breakEnd: "02:00 PM",
      totalHours: "8h 5m",
    },
    {
      id: "4",
      date: "09/01/25",
      checkIn: "09:00 am",
      checkOut: "06:05 PM",
      breakStart: "01:00 PM",
      breakEnd: "02:00 PM",
      totalHours: "8h 5m",
    },
  ];

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

  const handleCheckIn = () => {
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setCheckInTime(now);
    setIsCheckedIn(true);
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
    setCheckInTime(null);
    setIsOnBreak(false);
    setBreakStartTime(null);
  };

  const handleBreakStart = () => {
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setBreakStartTime(now);
    setIsOnBreak(true);
  };

  const handleBreakEnd = () => {
    setIsOnBreak(false);
    setBreakStartTime(null);
  };

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
                  <div className="avatar-circle-large">RM</div>
                </div>
                <div className="profile-info">
                  <h2 className="profile-name">Rajesh Mehta</h2>
                  <p className="profile-role">Sales Executive</p>
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
                  {!isCheckedIn ? (
                    <button className="check-in-btn" onClick={handleCheckIn}>
                      Check In
                    </button>
                  ) : (
                    <div className="checked-in-info">
                      <span className="check-in-time">
                        Checked in at {checkInTime}
                      </span>
                      <button
                        className="check-out-btn"
                        onClick={handleCheckOut}
                      >
                        Check Out
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Break Section */}
              {isCheckedIn && (
                <div className="break-section">
                  <h3>Break</h3>
                  <div className="break-buttons">
                    {!isOnBreak ? (
                      <button
                        className="break-start-btn"
                        onClick={handleBreakStart}
                      >
                        Start Break
                      </button>
                    ) : (
                      <div className="break-info">
                        <span className="break-time">
                          Break started at {breakStartTime}
                        </span>
                        <button
                          className="break-end-btn"
                          onClick={handleBreakEnd}
                        >
                          End Break
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Attendance Records */}
            <div className="attendance-records-card">
              <h3>Attendance History</h3>
              <div className="records-table">
                <div className="table-header">
                  <span>Date</span>
                  <span>Check In</span>
                  <span>Check Out</span>
                  <span>Break</span>
                  <span>Total</span>
                </div>
                {attendanceRecords.map((record) => (
                  <div key={record.id} className="table-row">
                    <span className="date-cell">{record.date}</span>
                    <span className="time-cell">{record.checkIn}</span>
                    <span className="time-cell">{record.checkOut}</span>
                    <span className="break-cell">
                      {record.breakStart} - {record.breakEnd}
                    </span>
                    <span className="total-cell">{record.totalHours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity-card">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-dot"></div>
                    <div className="activity-content">
                      <p className="activity-message">{activity.message}</p>
                      <span className="activity-time">{activity.timeAgo}</span>
                    </div>
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
