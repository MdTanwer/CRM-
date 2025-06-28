import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/user-schedule.css";
import { FaAngleLeft } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";

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
  const [showFilterTooltip, setShowFilterTooltip] = useState(false);
  const [filterValue, setFilterValue] = useState("Today");
  const filterTooltipRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const scheduleItems: ScheduleItem[] = [
    {
      id: "1",
      type: "Referral",
      phone: "949-265-8533",
      contact: "Brooklyn Williamson",
      avatar: "BW",
      date: "10/04/25",
      status: "upcoming",
    },
    {
      id: "2",
      type: "Referral",
      phone: "265-505-8854",
      contact: "Julia Watson",
      avatar: "JW",
      date: "10/04/25",
      status: "upcoming",
    },
    {
      id: "3",
      type: "Cold call",
      phone: "554-092-8895",
      contact: "Jenny Alexander",
      avatar: "JA",
      date: "10/04/25",
      status: "upcoming",
    },
  ];

  const filteredItems = scheduleItems.filter(
    (item) =>
      item.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery)
  );

  const handleNavigation = (route: string) => {
    navigate(`/user${route}`);
  };

  const toggleFilterTooltip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowFilterTooltip(!showFilterTooltip);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    setFilterValue(e.target.value);
  };

  const handleSaveFilter = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Apply filter logic here
    setShowFilterTooltip(false);
  };

  // Add a click handler to close the tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Don't close if clicking on the filter button, tooltip, or select element
      if (
        filterTooltipRef.current &&
        filterButtonRef.current &&
        !filterTooltipRef.current.contains(target) &&
        !filterButtonRef.current.contains(target) &&
        !target.closest(".schedule-filter-select") &&
        !target.closest("option")
      ) {
        setShowFilterTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="schedule-container">
      {/* Header */}
      <div className="schedule-header">
        <div className="schedule-brand-logo">
          Canova<span style={{ color: "#E8E000" }}>CRM</span>
        </div>
        <div className="schedule-header-nav">
          <button className="schedule-back-btn " onClick={() => navigate(-1)}>
            <FaAngleLeft />
            Schedule
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="schedule-search-container">
        <div className="schedule-search-input-wrapper">
          <svg
            className="schedule-search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="schedule-search-input"
          />
        </div>
        <button
          className="schedule-filter-btn"
          onClick={toggleFilterTooltip}
          type="button"
          ref={filterButtonRef}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
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

        {showFilterTooltip && (
          <div className="schedule-filter-tooltip" ref={filterTooltipRef}>
            <div className="schedule-filter-tooltip-header">Filter</div>
            <div className="schedule-filter-dropdown">
              <div className="schedule-filter-select-wrapper">
                <select
                  value={filterValue}
                  onChange={handleFilterChange}
                  className="schedule-filter-select"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="Today">Today</option>
                  <option value="All">All</option>
                </select>
              </div>
            </div>
            <br /> <br />
            <button
              className="schedule-filter-save-btn"
              onClick={handleSaveFilter}
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Schedule List */}
      <div className="schedule-list">
        {filteredItems.map((item) => (
          <div key={item.id} className="schedule-card">
            <div className="schedule-card-header">
              <div className="schedule-card-type">{item.type}</div>
              <div className="schedule-card-date">Date</div>
            </div>
            <div className="schedule-card-header">
              <div className="schedule-card-phone">{item.phone}</div>
              <div className="schedule-card-date-value">{item.date}</div>
            </div>

            <div className="schedule-card-details">
              <div className="schedule-call-icon">
                <MdLocationOn size={20} />
                <span>Call</span>
              </div>
            </div>
            <div className="schedule-card-contact-info">
              <div className="contact-avatar">
                {item.avatar.substring(0, 1)}
              </div>
              <div className="contact-name">{item.contact}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item" onClick={() => handleNavigation("/")}>
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
