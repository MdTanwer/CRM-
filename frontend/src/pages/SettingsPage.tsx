import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import "../styles/dashboard.css";
import "../styles/settings.css";

export const SettingsPage: React.FC = () => {
  const location = useLocation();
  const currentPage =
    location.pathname === "/" ? "dashboard" : location.pathname.slice(1);

  const [profileData, setProfileData] = useState({
    firstName: "Sutirtho",
    lastName: "Pal",
    email: "Sutirthopal@gmail.com",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log("Profile data:", profileData);
    alert("Profile updated successfully!");
  };

  const handleLogout = () => {
    // Handle logout functionality
    console.log("Logging out...");
    alert("Logged out successfully!");
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentPage={currentPage} />

      <div className="main-content">
        {/* Custom Settings Header */}
        <div className="header">
          <div className="breadcrumb">
            <span>Home</span>
            <span>&gt;</span>
            <span style={{ color: "#1f2937", fontWeight: "500" }}>
              Profile Settings
            </span>
          </div>

          <div className="header-actions">
            <button className="security-btn">🔒 Security</button>
            <button className="notifications-btn">🔔 Notifications</button>
            <button className="backup-btn">💾 Backup Data</button>
          </div>
        </div>

        <div className="settings-content">
          <div className="settings-container">
            <div className="profile-section">
              <h2 className="profile-title">Edit Profile</h2>

              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      placeholder="Sutirtho"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="lastName">Last name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      placeholder="Pal"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      placeholder="Sutirthopal@gmail.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={profileData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••••"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={profileData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••••"
                    />
                  </div>
                </div>

                <div className="profile-actions">
                  <button className="save-profile-btn" onClick={handleSave}>
                    Save
                  </button>
                </div>
              </div>
            </div>

            <div className="logout-section">
              <button className="logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
              <span className="logout-label">Profile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
