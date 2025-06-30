import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/user-leads.css";
import { MdLocationOn } from "react-icons/md";
import { HiPencilAlt } from "react-icons/hi";
import { IoTime } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import {
  getUserLeads,
  updateLeadStatus,
  updateLeadType,
  scheduleLeadCall,
} from "../services/leads.service";
import type { Lead as LeadType } from "../services/leads.service";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { BottomNavigation } from "../components/BottomNavigation";

export const UserLeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterTooltip, setShowFilterTooltip] = useState(false);
  const [filterValue, setFilterValue] = useState("All");
  const filterTooltipRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [leads, setLeads] = useState<LeadType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const [selectedStatus, setSelectedStatus] = useState<
    "Open" | "Closed" | "Ongoing" | "Pending"
  >("Ongoing");
  const statusTooltipRef = useRef<HTMLDivElement>(null);
  const statusButtonRef = useRef<HTMLButtonElement | null>(null);

  // Get dynamic greeting based on time of day
  const getGreeting = (): string => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "good morning";
    } else if (hour >= 12 && hour < 18) {
      return "good afternoon";
    } else {
      return "good evening";
    }
  };

  // Format date function - moved before it's used in filteredLeads
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Fetch leads for the logged-in user
  useEffect(() => {
    const fetchLeads = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const data = await getUserLeads(token);
        setLeads(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError("Failed to load leads. Please try again.");
        toast.error("Failed to load leads. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [token, navigate]);

  const filteredLeads = leads.filter((lead) => {
    // If no search query, just filter by type
    if (!searchQuery) {
      return filterValue === "All" || lead.type === filterValue;
    }

    const query = searchQuery.toLowerCase();

    // Search across all relevant lead fields
    const matchesSearch =
      // Basic info
      lead.name.toLowerCase().includes(query) ||
      (lead.email && lead.email.toLowerCase().includes(query)) ||
      (lead.phone && lead.phone.toLowerCase().includes(query)) ||
      // Status and type
      lead.status.toLowerCase().includes(query) ||
      lead.type.toLowerCase().includes(query) ||
      // Location and language
      lead.location.toLowerCase().includes(query) ||
      lead.language.toLowerCase().includes(query) ||
      // Dates (formatted for readability)
      formatDate(lead.receivedDate).toLowerCase().includes(query) ||
      formatDate(lead.createdAt).toLowerCase().includes(query);

    // Filter by lead type
    const matchesType = filterValue === "All" || lead.type === filterValue;

    return matchesSearch && matchesType;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Open":
        return "status-open";
      case "Ongoing":
        return "status-ongoing";
      case "Closed":
        return "status-closed";
      case "Pending":
        return "status-pending";
      default:
        return "status-ongoing";
    }
  };

  const getPriorityBadgeClass = (type: string) => {
    switch (type) {
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

  const handleTypeChange = async (
    leadId: string,
    type: "Hot" | "Warm" | "Cold"
  ) => {
    if (!token) return;

    try {
      // Update lead type in the backend
      await updateLeadType(token, leadId, type);

      // Update local state
      setLeads(
        leads.map((lead) => (lead._id === leadId ? { ...lead, type } : lead))
      );

      toast.success(`Lead type updated to ${type}`);
    } catch (error) {
      console.error("Error updating lead type:", error);
      toast.error("Failed to update lead type");
    }

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

  const handleSaveDateTime = async (leadId: string) => {
    if (!token || !dateValue || !timeValue) {
      toast.error("Please provide both date and time");
      return;
    }

    try {
      // Schedule call in the backend
      await scheduleLeadCall(token, leadId, dateValue, timeValue);

      toast.success("Call scheduled successfully");

      // Reset form
      setDateValue("");
      setTimeValue("");
    } catch (error) {
      console.error("Error scheduling call:", error);
      toast.error("Failed to schedule call");
    }

    // Close tooltip after saving
    setShowDateTimeTooltip(false);
    setActiveDateTimeLead(null);
  };

  const toggleStatusTooltip = (
    e: React.MouseEvent,
    leadId: string,
    currentStatus: "Open" | "Closed" | "Ongoing" | "Pending"
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

  const handleSaveStatus = async (leadId: string) => {
    if (!token) return;

    try {
      // Update lead status in the backend
      await updateLeadStatus(token, leadId, selectedStatus);

      // Update local state
      setLeads(
        leads.map((lead) =>
          lead._id === leadId ? { ...lead, status: selectedStatus } : lead
        )
      );

      toast.success(`Lead status updated to ${selectedStatus}`);
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast.error("Failed to update lead status");
    }

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

        <div className="leads-greeting">{getGreeting()}</div>
        <div className="leads-name">{user?.name || user?.email}</div>
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
        {loading ? (
          <div className="leads-loading">Loading leads...</div>
        ) : error ? (
          <div className="leads-error">{error}</div>
        ) : filteredLeads.length === 0 ? (
          <div className="leads-empty">
            {searchQuery || filterValue !== "All"
              ? "No leads match your search criteria"
              : "No leads assigned to you yet"}
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div key={lead._id} className="lead-card">
              <div className="lead-header">
                <div className="lead-info">
                  <h3 className="lead-name">{lead.name}</h3>
                  <p className="lead-email">{lead.email || "No email"}</p>
                </div>
                <div className="lead-status-circle">
                  <span
                    className={`status-badge ${getStatusBadgeClass(
                      lead.status
                    )}`}
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
                  <span>{formatDate(lead.receivedDate)}</span>
                </div>
              </div>

              <div className="lead-actions-row">
                <button
                  className="action-btn type-btn"
                  onClick={(e) => toggleTypeTooltip(e, lead._id)}
                  title="Change Type"
                  ref={activeLead === lead._id ? typeButtonRef : null}
                >
                  <HiPencilAlt />
                </button>

                {showTypeTooltip && activeLead === lead._id && (
                  <div className="type-tooltip" ref={typeTooltipRef}>
                    <div className="type-tooltip-header">Type</div>
                    <div className="type-options">
                      <button
                        className="type-option hot-option"
                        onClick={() => handleTypeChange(lead._id, "Hot")}
                      >
                        Hot
                      </button>
                      <button
                        className="type-option warm-option"
                        onClick={() => handleTypeChange(lead._id, "Warm")}
                      >
                        Warm
                      </button>
                      <button
                        className="type-option cold-option"
                        onClick={() => handleTypeChange(lead._id, "Cold")}
                      >
                        Cold
                      </button>
                    </div>
                  </div>
                )}

                <button
                  className="action-btn datetime-btn"
                  onClick={(e) => toggleDateTimeTooltip(e, lead._id)}
                  title="Set Date & Time"
                  ref={
                    activeDateTimeLead === lead._id ? dateTimeButtonRef : null
                  }
                >
                  <IoTime />
                </button>

                {showDateTimeTooltip && activeDateTimeLead === lead._id && (
                  <div className="datetime-tooltip" ref={dateTimeTooltipRef}>
                    <div className="datetime-tooltip-header">Date</div>
                    <input
                      type="date"
                      className="datetime-input"
                      value={dateValue}
                      onChange={(e) => setDateValue(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    <div className="datetime-tooltip-header">Time</div>
                    <input
                      type="time"
                      className="datetime-input"
                      value={timeValue}
                      onChange={(e) => setTimeValue(e.target.value)}
                    />
                    <button
                      className="datetime-save-btn"
                      onClick={() => handleSaveDateTime(lead._id)}
                    >
                      Save
                    </button>
                  </div>
                )}

                <button
                  className="action-btn status-btn"
                  onClick={(e) => toggleStatusTooltip(e, lead._id, lead.status)}
                  title="Change Status"
                  ref={activeStatusLead === lead._id ? statusButtonRef : null}
                >
                  <MdLocationOn />
                </button>

                {showStatusTooltip && activeStatusLead === lead._id && (
                  <div className="status-tooltip" ref={statusTooltipRef}>
                    <div className="status-tooltip-header">
                      Lead Status <span className="status-info-icon">i</span>
                    </div>
                    <div className="status-dropdown">
                      <select
                        value={selectedStatus}
                        onChange={(e) =>
                          setSelectedStatus(
                            e.target.value as
                              | "Open"
                              | "Closed"
                              | "Ongoing"
                              | "Pending"
                          )
                        }
                        className="status-select"
                      >
                        <option value="Open">Open</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Pending">Pending</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                    <button
                      className="status-save-btn"
                      onClick={() => handleSaveStatus(lead._id)}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
