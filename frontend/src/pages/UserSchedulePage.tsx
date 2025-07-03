import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/user-schedule.css";
import { FaAngleLeft } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import {
  getMySchedule,
  updateScheduleStatus,
} from "../services/schedule.service";
import type { ScheduleItem } from "../services/schedule.service";
import { toast } from "react-toastify";
import { format, parseISO, isToday, isTomorrow, isThisWeek } from "date-fns";
import { BottomNavigation } from "../components/BottomNavigation";

export const UserSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterTooltip, setShowFilterTooltip] = useState(false);
  const [filterValue, setFilterValue] = useState("All");
  const filterTooltipRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch schedule data
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const data = await getMySchedule(token);
        console.log("data", data);
        setScheduleItems(data.data.schedules);
        setError(null);
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setError("Failed to load schedule. Please try again.");
        toast.error("Failed to load schedule. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [token, navigate]);

  // Format date for display
  const formatScheduleDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "MM/dd/yy");
    } catch (error) {
      return dateString;
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle marking call as completed
  const handleCompleteCall = async (scheduleId: string) => {
    if (!token) return;

    try {
      await updateScheduleStatus(token, scheduleId, "completed");

      // Update local state
      setScheduleItems(
        scheduleItems.map((item) =>
          item._id === scheduleId ? { ...item, status: "completed" } : item
        )
      );

      toast.success("Call marked as completed");
    } catch (error) {
      console.error("Error updating call status:", error);
      toast.error("Failed to update call status");
    }
  };

  // Filter schedule items
  const filteredItems = scheduleItems.filter((item) => {
    // If no search query, just filter by date
    if (!searchQuery) {
      let matchesFilter = true;
      if (filterValue === "Today") {
        try {
          matchesFilter = isToday(parseISO(item.scheduledDate));
        } catch (error) {
          matchesFilter = false;
        }
      } else if (filterValue === "Tomorrow") {
        try {
          matchesFilter = isTomorrow(parseISO(item.scheduledDate));
        } catch (error) {
          matchesFilter = false;
        }
      } else if (filterValue === "This Week") {
        try {
          matchesFilter = isThisWeek(parseISO(item.scheduledDate));
        } catch (error) {
          matchesFilter = false;
        }
      }

      // Only show upcoming calls
      const isUpcoming = item.status === "upcoming";
      return matchesFilter && isUpcoming;
    }

    const query = searchQuery.toLowerCase().trim();

    // Simple text matching for basic fields
    const simpleTextMatches = (
      text: string | undefined | null,
      searchQuery: string
    ) => {
      if (!text) return false;
      const normalizedText = text.toLowerCase().trim();

      // Exact match
      if (normalizedText === searchQuery) return true;

      // Contains match
      if (normalizedText.includes(searchQuery)) return true;

      // Word starts with query (for partial matches)
      const words = normalizedText.split(/\s+/);
      return words.some((word) => word.startsWith(searchQuery));
    };

    // Advanced text matching with abbreviations for specific fields
    const advancedTextMatches = (
      text: string | undefined | null,
      searchQuery: string,
      fieldType: "status" | "type"
    ) => {
      if (!text) return false;
      const normalizedText = text.toLowerCase().trim();

      // First try simple matching
      if (simpleTextMatches(text, searchQuery)) return true;

      // Then try abbreviations/synonyms
      const getSearchVariations = (searchQuery: string, fieldType: string) => {
        const variations = [searchQuery];

        if (fieldType === "status") {
          const statusMap: { [key: string]: string[] } = {
            upcoming: ["upcoming", "scheduled", "pending", "active", "future"],
            completed: ["completed", "done", "finished", "closed"],
            cancelled: ["cancelled", "canceled", "aborted", "stopped"],
          };

          Object.entries(statusMap).forEach(([key, values]) => {
            if (values.includes(searchQuery) && normalizedText.includes(key)) {
              variations.push(key);
            }
          });
        } else if (fieldType === "type") {
          const typeMap: { [key: string]: string[] } = {
            hot: ["hot", "urgent", "priority", "important", "high"],
            warm: ["warm", "medium", "normal", "regular"],
            cold: ["cold", "low", "future", "potential"],
          };

          Object.entries(typeMap).forEach(([key, values]) => {
            if (values.includes(searchQuery) && normalizedText.includes(key)) {
              variations.push(key);
            }
          });
        }

        return [...new Set(variations)];
      };

      const searchVariations = getSearchVariations(searchQuery, fieldType);
      return searchVariations.some((variation) =>
        normalizedText.includes(variation)
      );
    };

    // Helper function for date and time matching with multiple formats
    const dateTimeMatches = (
      dateString: string,
      timeString: string,
      searchQuery: string
    ) => {
      try {
        const date = new Date(dateString);

        // Different date formats to check against
        const dateFormats = [
          format(date, "MMMM dd, yyyy").toLowerCase(), // "January 15, 2024"
          date.toLocaleDateString().toLowerCase(), // "1/15/2024"
          date
            .toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
            .toLowerCase(), // "Jan 15, 2024"
          date
            .toLocaleDateString("en-US", { month: "long", day: "numeric" })
            .toLowerCase(), // "January 15"
          date
            .toLocaleDateString("en-US", { month: "short", day: "numeric" })
            .toLowerCase(), // "Jan 15"
          date.toLocaleDateString("en-US", { month: "long" }).toLowerCase(), // "January"
          date.toLocaleDateString("en-US", { month: "short" }).toLowerCase(), // "Jan"
          date.getFullYear().toString(), // "2024"
          dateString.split("T")[0], // "2024-01-15" (ISO format)
        ];

        // Time formats to check against
        const timeFormats = [
          timeString.toLowerCase(), // "14:30"
          timeString.replace(":", "").toLowerCase(), // "1430"
        ];

        // Check if timeString can be converted to 12-hour format
        try {
          const [hours, minutes] = timeString.split(":");
          const hour12 = parseInt(hours) % 12 || 12;
          const ampm = parseInt(hours) >= 12 ? "pm" : "am";
          const time12Format = `${hour12}:${minutes} ${ampm}`;
          const time12FormatNoSpace = `${hour12}:${minutes}${ampm}`;
          timeFormats.push(
            time12Format.toLowerCase(),
            time12FormatNoSpace.toLowerCase()
          );
        } catch (e) {
          // If time conversion fails, continue with original formats
        }

        // Combined date and time formats
        const combinedFormats = [
          `${dateString} ${timeString}`.toLowerCase(),
          `${date.toLocaleDateString()} ${timeString}`.toLowerCase(),
        ];

        return (
          dateFormats.some((format) => format.includes(searchQuery)) ||
          timeFormats.some((format) => format.includes(searchQuery)) ||
          combinedFormats.some((format) => format.includes(searchQuery))
        );
      } catch (error) {
        return false;
      }
    };

    // Comprehensive search across all schedule item fields
    const matchesSearch =
      // Basic contact information (simple text matching)
      simpleTextMatches(item.name, query) ||
      simpleTextMatches(item.email, query) ||
      simpleTextMatches(item.phone, query) ||
      // Schedule classification (advanced matching with synonyms)
      advancedTextMatches(item.status, query, "status") ||
      advancedTextMatches(item.type, query, "type") ||
      // Date and time searches with multiple formats
      dateTimeMatches(item.scheduledDate, item.scheduledTime, query) ||
      // ID search (for technical users)
      item._id.toLowerCase().includes(query) ||
      item.leadId.toLowerCase().includes(query) ||
      // Partial phone number matching (without formatting)
      (item.phone &&
        item.phone.replace(/\D/g, "").includes(query.replace(/\D/g, ""))) ||
      // Email domain search
      (item.email &&
        item.email.split("@")[1] &&
        simpleTextMatches(item.email.split("@")[1], query)) ||
      // Combined field searches
      `${item.name} ${item.email || ""}`.toLowerCase().includes(query) ||
      `${item.type} ${item.status}`.toLowerCase().includes(query) ||
      `${item.scheduledDate} ${item.scheduledTime}`
        .toLowerCase()
        .includes(query);

    // Filter by date
    let matchesFilter = true;
    if (filterValue === "Today") {
      try {
        matchesFilter = isToday(parseISO(item.scheduledDate));
      } catch (error) {
        matchesFilter = false;
      }
    } else if (filterValue === "Tomorrow") {
      try {
        matchesFilter = isTomorrow(parseISO(item.scheduledDate));
      } catch (error) {
        matchesFilter = false;
      }
    } else if (filterValue === "This Week") {
      try {
        matchesFilter = isThisWeek(parseISO(item.scheduledDate));
      } catch (error) {
        matchesFilter = false;
      }
    }

    // Only show upcoming calls
    const isUpcoming = item.status === "upcoming";

    return matchesSearch && matchesFilter && isUpcoming;
  });

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
      <div className="profile-header">
        <div className="profile-brand-logo">
          Canova<span style={{ color: "#E8E000" }}>CRM</span>
        </div>
        <div className="profile-header-nav">
          <button className="profile-back-btn" onClick={() => navigate(-1)}>
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
                  <option value="All">All</option>
                  <option value="Today">Today</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="This Week">This Week</option>
                </select>
              </div>
            </div>
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
        {loading ? (
          <div className="schedule-loading">Loading schedule...</div>
        ) : error ? (
          <div className="schedule-error">{error}</div>
        ) : filteredItems.length === 0 ? (
          <div className="schedule-empty">
            {searchQuery || filterValue !== "All"
              ? "No scheduled calls match your search criteria"
              : "No upcoming calls scheduled"}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item._id} className="schedule-card">
              <div className="schedule-card-header">
                <div className="schedule-card-type">{item.type}</div>
                <div className="schedule-card-date">Date</div>
              </div>
              <div className="schedule-card-header">
                <div className="schedule-card-phone">
                  {item.phone || "No phone"}
                </div>
                <div className="schedule-card-date-value">
                  {formatScheduleDate(item.scheduledDate)} {item.scheduledTime}
                </div>
              </div>

              <div className="schedule-card-details">
                <div
                  className="schedule-call-icon"
                  onClick={() => handleCompleteCall(item._id)}
                  title="Mark as completed"
                >
                  <MdLocationOn size={20} />
                  <span>Call</span>
                </div>
              </div>
              <div className="schedule-card-contact-info">
                <div className="contact-avatar">{getInitials(item.name)}</div>
                <div className="contact-name">{item.name}</div>
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
