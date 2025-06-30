import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      type: "Break",
      startTime: "01:25 pm",
      endTime: "02:15 PM",
      date: "10/04/25",
    },
    {
      id: "2",
      type: "Break",
      startTime: "01:00 pm",
      endTime: "02:05 PM",
      date: "09/04/25",
    },
    {
      id: "3",
      type: "Break",
      startTime: "01:05 pm",
      endTime: "02:30 PM",
      date: "08/04/25",
    },
    {
      id: "4",
      type: "Break",
      startTime: "01:10 pm",
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
              <div className="status-time">01:25 pm</div>
            </div>

            <div className="toggle-switch-container">
              <div className="toggle-switch-pill active">
                <div className="toggle-switch-button"></div>
              </div>
            </div>
          </div>

          <div className="timing-table">
            {timingEntries.map((entry) => (
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
          </div>
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
      <BottomNavigation />
    </div>
  );
};
