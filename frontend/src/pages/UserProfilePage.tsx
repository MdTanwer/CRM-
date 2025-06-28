import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/user-profile.css";
import { FaAngleLeft } from "react-icons/fa";

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    firstName: "Rajesh",
    lastName: "Mehta",
    email: "rajesh.mehta55@gmail.com",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Save logic here
    console.log("Saving profile data:", profileData);
  };

  const handleNavigation = (route: string) => {
    navigate(`/user${route}`);
  };

  return (
    <div className="user-profile-container">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-brand-logo">
          Canova<span style={{ color: "#E8E000" }}>CRM</span>
        </div>
        <div className="profile-header-nav">
          <button className=" profile-back-btn" onClick={() => navigate(-1)}>
            <FaAngleLeft />
            Profile
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <div className="profile-content">
        <form onSubmit={handleSave}>
          <div className="user-profile-form-group">
            <label htmlFor="firstName">First name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={profileData.firstName}
              onChange={handleChange}
              className="user-profile-form-input"
            />
          </div>

          <div className="user-profile-form-group">
            <label htmlFor="lastName">Last name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={profileData.lastName}
              onChange={handleChange}
              className="user-profile-form-input"
            />
          </div>

          <div className="user-profile-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleChange}
              className="user-profile-form-input"
            />
          </div>

          <div className="user-profile-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={profileData.password}
              onChange={handleChange}
              className="user-profile-form-input"
              placeholder="••••••••••"
            />
          </div>

          <div className="user-profile-form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={profileData.confirmPassword}
              onChange={handleChange}
              className="user-profile-form-input"
              placeholder="••••••••••"
            />
          </div>

          <button type="submit" className="user-profile-save-button">
            Save
          </button>
        </form>
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
