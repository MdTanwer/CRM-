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
import { BottomNavigation } from "../components/BottomNavigation";

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, setUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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
          password: "",
          confirmPassword: "",
        });
      } catch (err) {
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }

    // Validate passwords if provided
    if (
      profileData.password &&
      profileData.password !== profileData.confirmPassword
    ) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const updateData: any = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      };

      // Only include password if it's provided
      if (profileData.password) {
        updateData.password = profileData.password;
        updateData.confirmPassword = profileData.confirmPassword;
      }

      const updatedUser = await updateUserProfile(token, updateData);

      // Update user in context if needed
      if (setUser && user) {
        setUser({
          _id: user._id,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
          name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        });
      }

      // Clear password fields after successful update
      setProfileData({
        ...profileData,
        password: "",
        confirmPassword: "",
      });

      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="user-profile-container">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-brand-logo">
          Canova<span style={{ color: "#E8E000" }}>CRM</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className="profile-header-nav">
            <button className="profile-back-btn" onClick={() => navigate(-1)}>
              <FaAngleLeft />
              Profile
            </button>
          </div>
          <div>
            <button
              onClick={handleLogout}
              style={{
                background: "linear-gradient(135deg, #ff4757 0%, #ff3742 100%)",
                border: "none",
                color: "white",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                padding: "8px 16px",
                borderRadius: "8px",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 4px rgba(255, 71, 87, 0.2)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(255, 71, 87, 0.3)";
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #ff3742 0%, #ff2833 100%)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 4px rgba(255, 71, 87, 0.2)";
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #ff4757 0%, #ff3742 100%)";
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="profile-content">
        {loading ? (
          <div className="profile-loading">Loading...</div>
        ) : (
          <form onSubmit={handleSaveProfile}>
            <div className="profile-form-group">
              <label htmlFor="firstName">First name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profileData.firstName}
                onChange={handleProfileChange}
                className="profile-form-input"
                placeholder="Enter your first name"
                required
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="lastName">Last name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profileData.lastName}
                onChange={handleProfileChange}
                className="profile-form-input"
                placeholder="Enter your last name"
                required
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                readOnly
                className="profile-form-input profile-form-input-readonly"
                placeholder="your.email@company.com"
              />
              <small className="form-help-text">Email cannot be changed</small>
            </div>

            <div className="profile-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={profileData.password}
                onChange={handleProfileChange}
                className="profile-form-input"
                placeholder="Enter new password"
              />
              <small className="form-help-text">
                Leave blank to keep current password
              </small>
            </div>

            <div className="profile-form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={profileData.confirmPassword}
                onChange={handleProfileChange}
                className="profile-form-input"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              className="profile-save-button"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
