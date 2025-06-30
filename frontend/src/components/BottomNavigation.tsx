import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/bottom-navigation.css";

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (route: string) => {
    navigate(`/user${route}`);
  };

  const isActive = (path: string) => {
    return location.pathname === `/user${path}`;
  };

  return (
    <div className="bottom-nav">
      <button
        className={`nav-item ${isActive("") ? "active" : ""}`}
        onClick={() => handleNavigation("")}
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

      <button
        className={`nav-item ${isActive("/leads") ? "active" : ""}`}
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
        className={`nav-item ${isActive("/schedule") ? "active" : ""}`}
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
        className={`nav-item ${isActive("/profile") ? "active" : ""}`}
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
  );
};
