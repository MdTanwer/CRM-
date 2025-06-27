import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/user-dashboard.css";

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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timing, setTiming] = useState<TimingInfo>({
    checkedIn: true,
    checkInTime: "9:15 AM",
    onBreak: false,
    breakStartTime: null,
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timingEntries: TimingEntry[] = [
    {
      id: "1",
      type: "Check",
      startTime: "09:25",
      endTime: "02:10 PM",
      date: "10/04/25",
    },
    {
      id: "2",
      type: "Break",
      startTime: "01:25 pm",
      endTime: "01:25 PM",
      date: "10/04/25",
    },
    {
      id: "3",
      type: "Check",
      startTime: "11:00 pm",
      endTime: "03:05 PM",
      date: "09/04/25",
    },
    {
      id: "4",
      type: "Break",
      startTime: "01:00 pm",
      endTime: "01:30 PM",
      date: "09/04/25",
    },
    {
      id: "5",
      type: "Check",
      startTime: "01:00 pm",
      endTime: "03:30 PM",
      date: "08/04/25",
    },
    {
      id: "6",
      type: "Break",
      startTime: "01:00 pm",
      endTime: "02:00 PM",
      date: "07/04/25",
    },
  ];

  const recentActivity: ActivityItem[] = [
    {
      id: "1",
      message: "You were assigned 3 more new lead",
      time: "1 hour ago",
      type: "lead",
    },
    {
      id: "2",
      message: "You Closed a deal today - 2 hours ago",
      time: "",
      type: "deal",
    },
  ];

  const handleCheckIn = () => {
    setTiming({
      ...timing,
      checkedIn: true,
      checkInTime: new Date().toLocaleTimeString(),
    });
  };

  const handleCheckOut = () => {
    setTiming({
      checkedIn: false,
      checkInTime: null,
      onBreak: false,
      breakStartTime: null,
    });
  };

  const handleBreakStart = () => {
    setTiming({
      ...timing,
      onBreak: true,
      breakStartTime: new Date().toLocaleTimeString(),
    });
  };

  const handleBreakEnd = () => {
    setTiming({
      ...timing,
      onBreak: false,
      breakStartTime: null,
    });
  };

  const handleNavigation = (route: string) => {
    if (route === "/") {
      // Stay on dashboard
      return;
    }
    navigate(`/user${route}`);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="user-dashboard-container">
      {/* Header with CanovasCRM branding */}
      <div className="dashboard-header ">
        <div className="brand-logo">
          Canova<span style={{ color: "#E8E000" }}>CRM</span>
        </div>
        <div className="greeting">Good Morning</div>
        <div className="user-name">Rajesh Mehta</div>
      </div>

      {/* Current Time Display */}
      <div className="time-section">
        <div className="current-time">
          <div className="time-display">{formatTime(currentTime)}</div>
          <div className="date-display">{formatDate(currentTime)}</div>
        </div>
      </div>

      <div>
        {" "}
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
        <div className="">
          <div className="status-label">Check-in</div>
          <div className="status-time">9:15 AM</div>
        </div>
        <div className="s">
          <div className="status-label">Check Out</div>
          <div className="status-time">4:30 PM</div>
        </div>

        <div className="toggle-switch-container">
          <div className="toggle-switch-pill active">
            <div className="toggle-switch-button"></div>
          </div>
        </div>
      </div>

      <div className="timings-section">
        {/* Timing History Table */}
        <div className="">
          <div className="timing-status-cards" style={{ margin: "0px" }}>
            <div>
              <div className="status-label">Break</div>
              <div className="status-time">9:15 AM</div>
            </div>

            <div className="toggle-switch-container">
              <div className="toggle-switch-pill active">
                <div className="toggle-switch-button"></div>
              </div>
            </div>
          </div>
          {timingEntries.map((entry) => (
            <div key={entry.id} className="table-row">
              <div className="time-cell">{entry.startTime}</div>
              <div className="time-cell">{entry.endTime}</div>
              <div className="date-cell">{entry.date}</div>
            </div>
          ))}
        </div>
      </div>

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
      <div className="bottom-nav">
        <button
          className="nav-item active"
          onClick={() => handleNavigation("/")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
          <span>Home</span>
        </button>

        <button className="nav-item" onClick={() => handleNavigation("/leads")}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Leads</span>
        </button>

        <button
          className="nav-item"
          onClick={() => handleNavigation("/schedule")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Schedule</span>
        </button>

        <button
          className="nav-item"
          onClick={() => handleNavigation("/profile")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
};
