import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/dashboard.css";
import "../styles/settings.css";
import "../styles/employees.css";
import { ADMIN_API } from "../config/api.config";

export const SettingsPage: React.FC = () => {
  const location = useLocation();
  const currentPage =
    location.pathname === "/" ? "dashboard" : location.pathname.slice(1);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  // Fetch superadmin data on component mount
  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch admin data from API
      const response = await fetch(ADMIN_API);
      const result = await response.json();

      if (result.status === "success") {
        const userData = result.data.user;
        setProfileData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          role: userData.role || "superadmin",
          password: "",
          confirmPassword: "",
        });
      } else {
        toast.error("Failed to load admin data");
      }
    } catch (error) {
      toast.error("Error loading admin data. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // Validate passwords if both are provided
      if (
        profileData.password &&
        profileData.password !== profileData.confirmPassword
      ) {
        toast.error("Passwords do not match");

        return;
      }

      // Send update to API
      const response = await fetch(`${ADMIN_API}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        toast.success("Superadmin profile updated successfully!");
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="dashboard-container" style={{ backgroundColor: "white" }}>
      <Sidebar currentPage={currentPage} />

      <div className="main-content">
        {/* Custom Settings Header */}
        <div className="emp-header">
          <div className="emp-header-actions">
            <div className="emp-search-container">
              <input
                type="text"
                placeholder="Search employees by name, ID..."
                className="search-input"
              />
            </div>
          </div>
        </div>

        <div
          className="emp-breadcrumbs"
          style={{ marginTop: "10px", marginLeft: "50px" }}
        >
          <span className="emp-breadcrumb-item">Home</span>
          <span className="emp-breadcrumb-separator">&gt;</span>
          <Link
            to="/settings"
            className="emp-breadcrumb-item"
            style={{ textDecoration: "none" }}
          >
            Settings
          </Link>
        </div>
        <div className="settings-content" style={{ backgroundColor: "white" }}>
          <div className="settings-container">
            <div className="profile-section">
              <p className="profile-title">Edit Profile</p>

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
                      placeholder="First name"
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
                      placeholder="Last name"
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
                      placeholder="Email address"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={profileData.role}
                      disabled={true}
                      className="disabled-input"
                    />
                    <small className="form-hint">Role cannot be changed</small>
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
          </div>
        </div>
      </div>
    </div>
  );
};
