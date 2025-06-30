import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/user-profile.css";
import { FaAngleLeft } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
} from "../services/user.service";
import { toast } from "react-toastify";

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const userData = await getUserProfile(token);
        setProfileData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const updatedUser = await updateUserProfile(token, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      });

      // Update user in context if needed
      if (setUser) {
        setUser({
          ...user,
          name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        });
      }

      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      await updateUserPassword(
        token,
        passwordData.currentPassword,
        passwordData.newPassword
      );

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password updated successfully");
    } catch (err) {
      console.error("Error updating password:", err);
      toast.error(
        "Failed to update password. Please check your current password."
      );
    } finally {
      setLoading(false);
    }
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
          <button className="profile-back-btn" onClick={() => navigate(-1)}>
            <FaAngleLeft />
            Profile
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={`profile-tab ${activeTab === "password" ? "active" : ""}`}
          onClick={() => setActiveTab("password")}
        >
          Password
        </button>
      </div>

      {/* Profile Form */}
      <div className="profile-content">
        {loading ? (
          <div className="profile-loading">Loading...</div>
        ) : activeTab === "profile" ? (
          <form onSubmit={handleSaveProfile}>
            <div className="user-profile-form-group">
              <label htmlFor="firstName">First name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profileData.firstName}
                onChange={handleProfileChange}
                className="user-profile-form-input"
                required
              />
            </div>

            <div className="user-profile-form-group">
              <label htmlFor="lastName">Last name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profileData.lastName}
                onChange={handleProfileChange}
                className="user-profile-form-input"
                required
              />
            </div>

            <div className="user-profile-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                readOnly
                className="user-profile-form-input user-profile-form-input-readonly"
              />
              <small className="form-text">Email cannot be changed</small>
            </div>

            <button
              type="submit"
              className="user-profile-save-button"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleUpdatePassword}>
            <div className="user-profile-form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="user-profile-form-input"
                required
                placeholder="••••••••••"
              />
            </div>

            <div className="user-profile-form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="user-profile-form-input"
                required
                placeholder="••••••••••"
                minLength={6}
              />
            </div>

            <div className="user-profile-form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="user-profile-form-input"
                required
                placeholder="••••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="user-profile-save-button"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
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
