import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/mobile-profile.css";

export const MobileProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "Rajesh",
    lastName: "Mehta",
    email: "rajesh.mehta@gmail.com",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saving profile:", formData);
    // Implement save functionality
  };

  const handleBackNavigation = () => {
    navigate("/mobile/schedule"); // Navigate to mobile schedule page
  };

  const handleNavigation = (route: string) => {
    navigate(`/mobile${route}`);
  };

  return (
    <div className="mobile-profile-container">
      {/* Header */}
      <div className="mobile-profile-header">
        <div className="header-content">
          <button className="back-btn" onClick={handleBackNavigation}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="header-title">Profile</h1>
        </div>
        <div className="brand-section">
          <h2 className="brand-name">CanovaCRM</h2>
        </div>
      </div>

      {/* Form Content */}
      <div className="profile-form">
        <div className="form-group">
          <label htmlFor="firstName">First name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="First name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Last name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm Password"
          />
        </div>

        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-navigation">
        <button className="nav-item" onClick={() => handleNavigation("/")}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9,22 9,12 15,12 15,22"></polyline>
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>Schedule</span>
        </button>
        <button
          className="nav-item active"
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
