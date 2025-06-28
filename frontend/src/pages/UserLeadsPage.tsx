import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/user-leads.css";
import { MdLocationOn } from "react-icons/md";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: "Ongoing" | "Closed";
  priority: "Hot" | "Warm" | "Cold";
  date: string;
}

export const UserLeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterTooltip, setShowFilterTooltip] = useState(false);
  const [filterValue, setFilterValue] = useState("All");
  const filterTooltipRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const leads: Lead[] = [
    {
      id: "1",
      name: "Tamer Finata",
      email: "@tamerfinata@gmail.com",
      status: "Ongoing",
      priority: "Hot",
      date: "April 04, 2025",
    },
    {
      id: "2",
      name: "Tamer Finata",
      email: "@tamerfinata@gmail.com",
      status: "Ongoing",
      priority: "Warm",
      date: "April 04, 2025",
    },
    {
      id: "3",
      name: "Tamer Finata",
      email: "@tamerfinata@gmail.com",
      status: "Closed",
      priority: "Cold",
      date: "April 04, 2025",
    },
  ];

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCall = (lead: Lead) => {
    console.log("Calling", lead.name);
    // Implement call functionality
  };

  const handleMessage = (lead: Lead) => {
    console.log("Messaging", lead.name);
    // Implement message functionality
  };

  const handleEmail = (lead: Lead) => {
    console.log("Emailing", lead.name);
    // Implement email functionality
  };

  const getStatusBadgeClass = (status: string) => {
    return status === "Ongoing" ? "status-ongoing" : "status-closed";
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "Hot":
        return "priority-hot";
      case "Warm":
        return "priority-warm";
      case "Cold":
        return "priority-cold";
      default:
        return "priority-cold";
    }
  };

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
        !target.closest(".leads-filter-select") &&
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
    <div className="user-leads-container">
      {/* Header with CanovasCRM branding */}
      <div className="leads-header">
        <div className="leads-brand-logo">
          Canova<span style={{ color: "#E8E000" }}>CRM</span>
        </div>

        <div className="leads-greeting">good morning</div>
        <div className="leads-name">Ragesh Shrestha</div>
      </div>

      {/* Search Bar */}
      <div className="leads-search-container">
        <div className="leads-search-input-wrapper">
          <svg
            className="leads-search-icon"
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
            className="leads-search-input"
          />
        </div>
        <button
          className="leads-filter-btn"
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
          <div className="leads-filter-tooltip" ref={filterTooltipRef}>
            <div className="leads-filter-tooltip-header">Filter</div>
            <div className="leads-filter-dropdown">
              <div className="leads-filter-select-wrapper">
                <select
                  value={filterValue}
                  onChange={handleFilterChange}
                  className="leads-filter-select"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="All">All</option>
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                </select>
              </div>
            </div>
            <button
              className="leads-filter-save-btn"
              onClick={handleSaveFilter}
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Leads List */}
      <div className="leads-list">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="lead-card">
            <div className="lead-header">
              <div className="lead-info">
                <h3 className="lead-name">{lead.name}</h3>
                <p className="lead-email">{lead.email}</p>
              </div>
              <div className="lead-badges">
                <span
                  className={`status-badge ${getStatusBadgeClass(lead.status)}`}
                >
                  {lead.status}
                </span>
              </div>
            </div>

            <div className="lead-details">
              <div className="lead-date">
                <svg
                  width="14"
                  height="14"
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
                <span>date</span>
              </div>
              <span
                className={`priority-badge ${getPriorityBadgeClass(
                  lead.priority
                )}`}
              >
                {lead.priority}
              </span>
            </div>

            <div className="lead-footer">
              <span className="date-text">{lead.date}</span>
              <div className="lead-actions">
                <button
                  className="action-btn call-btn"
                  onClick={() => handleCall(lead)}
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
                  className="action-btn message-btn"
                  onClick={() => handleMessage(lead)}
                  title="Message"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>

                <button
                  className="action-btn email-btn"
                  onClick={() => handleEmail(lead)}
                  title="Email"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </button>
              </div>
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

        <button
          className="nav-item active"
          onClick={() => handleNavigation("/leads")}
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
          <span>Leads</span>
        </button>

        <button
          className="nav-item "
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
