import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/user-schedule.css";

interface ScheduleItem {
  id: string;
  type: "Referral" | "Cold call";
  phone: string;
  contact: string;
  avatar: string;
  date: string;
  status: "upcoming" | "completed";
}

export const UserSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const scheduleItems: ScheduleItem[] = [
    {
      id: "1",
      type: "Referral",
      phone: "569-505-8855",
      contact: "Jocelyn Westman",
      avatar: "JW",
      date: "30/04/25",
      status: "upcoming",
    },
    {
      id: "2",
      type: "Referral",
      phone: "569-505-8854",
      contact: "Call",
      avatar: "C",
      date: "30/04/25",
      status: "upcoming",
    },
    {
      id: "3",
      type: "Referral",
      phone: "",
      contact: "Julia Wellman",
      avatar: "JW",
      date: "",
      status: "upcoming",
    },
    {
      id: "4",
      type: "Cold call",
      phone: "554-000-8898",
      contact: "Jenny Alexander",
      avatar: "JA",
      date: "30/04/25",
      status: "upcoming",
    },
  ];

  const filteredItems = scheduleItems.filter(
    (item) =>
      item.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery)
  );

  const handleCall = (item: ScheduleItem) => {
    console.log("Calling", item.contact);
    // Implement call functionality
  };

  const handleSchedule = (item: ScheduleItem) => {
    console.log("Scheduling", item.contact);
    // Implement schedule functionality
  };

  const handleMore = (item: ScheduleItem) => {
    console.log("More options for", item.contact);
    // Implement more options functionality
  };

  const getItemTypeClass = (type: string) => {
    return type === "Referral" ? "type-referral" : "type-cold-call";
  };

  const getAvatarColor = (type: string) => {
    return type === "Referral" ? "avatar-blue" : "avatar-gray";
  };

  const handleNavigation = (route: string) => {
    navigate(`/user${route}`);
  };

  return (
    <div className="user-schedule-container">
      {/* Header with CanovasCRM branding */}
      {/* <div className="user-header">
        <div className="header-top">
          <div className="brand-logo">CanovaCRM</div>
        </div>
        <div className="header-nav">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ←
          </button>
          <h1 className="page-title">Schedule</h1>
        </div>
      </div> */}

      <div className="dashboard-header ">
        <div className="brand-logo">
          Canova<span style={{ color: "#E8E000" }}>CRM</span>
        </div>
        <div className="greeting">Good Morning</div>
        <div className="user-name">Rajesh Mehta</div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <svg
            className="search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="filter-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Schedule List */}
      <div className="schedule-list">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`schedule-card ${getItemTypeClass(item.type)}`}
          >
            {/* Card Header */}
            <div className="card-header">
              <div className="card-header-left">
                <span className="item-type">{item.type}</span>
                <span className="item-date">{item.date}</span>
              </div>
            </div>

            {/* Card Content */}
            <div className="card-content">
              <div className="contact-info">
                {item.phone && (
                  <div className="phone-number">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>{item.phone}</span>
                  </div>
                )}

                <div className="contact-person">
                  <div
                    className={`contact-avatar ${getAvatarColor(item.type)}`}
                  >
                    {item.avatar}
                  </div>
                  <span className="contact-name">{item.contact}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="card-actions">
                <button
                  className="action-btn call-btn"
                  onClick={() => handleCall(item)}
                  title="Call"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </button>

                <button
                  className="action-btn schedule-btn"
                  onClick={() => handleSchedule(item)}
                  title="Reschedule"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </button>

                <button
                  className="action-btn more-btn"
                  onClick={() => handleMore(item)}
                  title="More options"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="5" r="1"></circle>
                    <circle cx="12" cy="19" r="1"></circle>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item" onClick={() => handleNavigation("/leads")}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Leads</span>
        </button>

        <button
          className="nav-item active"
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
};
