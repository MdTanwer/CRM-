import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/user-leads.css";
import { MdLocationOn } from "react-icons/md";
import { HiPencilAlt } from "react-icons/hi";
import { IoTime } from "react-icons/io5";

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

  // Type tooltip state
  const [showTypeTooltip, setShowTypeTooltip] = useState(false);
  const [activeLead, setActiveLead] = useState<string | null>(null);
  const typeTooltipRef = useRef<HTMLDivElement>(null);
  const typeButtonRef = useRef<HTMLButtonElement | null>(null);

  // DateTime tooltip state
  const [showDateTimeTooltip, setShowDateTimeTooltip] = useState(false);
  const [activeDateTimeLead, setActiveDateTimeLead] = useState<string | null>(
    null
  );
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const dateTimeTooltipRef = useRef<HTMLDivElement>(null);
  const dateTimeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Status tooltip state
  const [showStatusTooltip, setShowStatusTooltip] = useState(false);
  const [activeStatusLead, setActiveStatusLead] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<"Ongoing" | "Closed">(
    "Ongoing"
  );
  const statusTooltipRef = useRef<HTMLDivElement>(null);
  const statusButtonRef = useRef<HTMLButtonElement | null>(null);

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

  // Add a click handler to close the tooltips when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Handle filter tooltip
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

      // Handle type tooltip
      if (
        typeTooltipRef.current &&
        typeButtonRef.current &&
        !typeTooltipRef.current.contains(target) &&
        !typeButtonRef.current.contains(target)
      ) {
        setShowTypeTooltip(false);
        setActiveLead(null);
      }

      // Handle date/time tooltip
      if (
        dateTimeTooltipRef.current &&
        dateTimeButtonRef.current &&
        !dateTimeTooltipRef.current.contains(target) &&
        !dateTimeButtonRef.current.contains(target)
      ) {
        setShowDateTimeTooltip(false);
        setActiveDateTimeLead(null);
      }

      // Handle status tooltip
      if (
        statusTooltipRef.current &&
        statusButtonRef.current &&
        !statusTooltipRef.current.contains(target) &&
        !statusButtonRef.current.contains(target)
      ) {
        setShowStatusTooltip(false);
        setActiveStatusLead(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleTypeTooltip = (e: React.MouseEvent, leadId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeLead === leadId && showTypeTooltip) {
      setShowTypeTooltip(false);
      setActiveLead(null);
    } else {
      setShowTypeTooltip(true);
      setActiveLead(leadId);
      // Store the current button as reference
      typeButtonRef.current = e.currentTarget as HTMLButtonElement;
    }
  };

  const handleTypeChange = (
    leadId: string,
    priority: "Hot" | "Warm" | "Cold"
  ) => {
    // Update lead priority logic here
    console.log(`Changing lead ${leadId} priority to ${priority}`);

    // Close tooltip after selection
    setShowTypeTooltip(false);
    setActiveLead(null);
  };

  const toggleDateTimeTooltip = (e: React.MouseEvent, leadId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeDateTimeLead === leadId && showDateTimeTooltip) {
      setShowDateTimeTooltip(false);
      setActiveDateTimeLead(null);
    } else {
      setShowDateTimeTooltip(true);
      setActiveDateTimeLead(leadId);
      // Store the current button as reference
      dateTimeButtonRef.current = e.currentTarget as HTMLButtonElement;
    }
  };

  const handleSaveDateTime = (leadId: string) => {
    // Update lead date/time logic here
    console.log(
      `Updating lead ${leadId} date to ${dateValue} and time to ${timeValue}`
    );

    // Close tooltip after saving
    setShowDateTimeTooltip(false);
    setActiveDateTimeLead(null);
  };

  const toggleStatusTooltip = (
    e: React.MouseEvent,
    leadId: string,
    currentStatus: "Ongoing" | "Closed"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeStatusLead === leadId && showStatusTooltip) {
      setShowStatusTooltip(false);
      setActiveStatusLead(null);
    } else {
      setShowStatusTooltip(true);
      setActiveStatusLead(leadId);
      setSelectedStatus(currentStatus);
      // Store the current button as reference
      statusButtonRef.current = e.currentTarget as HTMLButtonElement;
    }
  };

  const handleSaveStatus = (leadId: string) => {
    // Update lead status logic here
    console.log(`Updating lead ${leadId} status to ${selectedStatus}`);

    // Close tooltip after saving
    setShowStatusTooltip(false);
    setActiveStatusLead(null);
  };

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
              <div className="lead-status-circle">
                <span
                  className={`status-badge ${getStatusBadgeClass(lead.status)}`}
                >
                  {lead.status}
                </span>
              </div>
            </div>

            <div className="lead-date-section">
              <span className="lead-date-label">date</span>
              <div className="lead-date-value">
                <svg
                  width="16"
                  height="16"
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
                <span>{lead.date}</span>
              </div>
            </div>

            <div className="lead-actions-row">
              <button
                className="action-btn type-btn"
                onClick={(e) => toggleTypeTooltip(e, lead.id)}
                title="Change Type"
                ref={activeLead === lead.id ? typeButtonRef : null}
              >
                <HiPencilAlt />
              </button>

              {showTypeTooltip && activeLead === lead.id && (
                <div className="type-tooltip" ref={typeTooltipRef}>
                  <div className="type-tooltip-header">Type</div>
                  <div className="type-options">
                    <button
                      className="type-option hot-option"
                      onClick={() => handleTypeChange(lead.id, "Hot")}
                    >
                      Hot
                    </button>
                    <button
                      className="type-option warm-option"
                      onClick={() => handleTypeChange(lead.id, "Warm")}
                    >
                      Warm
                    </button>
                    <button
                      className="type-option cold-option"
                      onClick={() => handleTypeChange(lead.id, "Cold")}
                    >
                      Cold
                    </button>
                  </div>
                </div>
              )}

              <button
                className="action-btn datetime-btn"
                onClick={(e) => toggleDateTimeTooltip(e, lead.id)}
                title="Set Date & Time"
                ref={activeDateTimeLead === lead.id ? dateTimeButtonRef : null}
              >
                <IoTime />
              </button>

              {showDateTimeTooltip && activeDateTimeLead === lead.id && (
                <div className="datetime-tooltip" ref={dateTimeTooltipRef}>
                  <div className="datetime-tooltip-header">Date</div>
                  <input
                    type="text"
                    className="datetime-input"
                    placeholder="dd/mm/yy"
                    value={dateValue}
                    onChange={(e) => setDateValue(e.target.value)}
                  />
                  <div className="datetime-tooltip-header">Time</div>
                  <input
                    type="text"
                    className="datetime-input"
                    placeholder="02:30PM"
                    value={timeValue}
                    onChange={(e) => setTimeValue(e.target.value)}
                  />
                  <button
                    className="datetime-save-btn"
                    onClick={() => handleSaveDateTime(lead.id)}
                  >
                    Save
                  </button>
                </div>
              )}

              <button
                className="action-btn status-btn"
                onClick={(e) => toggleStatusTooltip(e, lead.id, lead.status)}
                title="Change Status"
                ref={activeStatusLead === lead.id ? statusButtonRef : null}
              >
                <MdLocationOn />
              </button>

              {showStatusTooltip && activeStatusLead === lead.id && (
                <div className="status-tooltip" ref={statusTooltipRef}>
                  <div className="status-tooltip-header">
                    Lead Status <span className="status-info-icon">i</span>
                  </div>
                  <div className="status-dropdown">
                    <select
                      value={selectedStatus}
                      onChange={(e) =>
                        setSelectedStatus(
                          e.target.value as "Ongoing" | "Closed"
                        )
                      }
                      className="status-select"
                    >
                      <option value="Ongoing">Ongoing</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <button
                    className="status-save-btn"
                    onClick={() => handleSaveStatus(lead.id)}
                  >
                    Save
                  </button>
                </div>
              )}
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
