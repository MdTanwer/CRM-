import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/user-profile.css";

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Ragesh Shrestha",
    email: "ragesh.shrestha@company.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    language: "English",
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
  };

  const handleScheduleNavigation = () => {
    navigate("/user/schedule"); // Navigate to user schedule page
  };

  const handleNavigation = (route: string) => {
    navigate(`/user${route}`);
  };

  return (
    <div className="user-profile-container">
      {/* Header */}
      <div className="user-profile-header">
        <div className="header-top">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ←
          </button>
          <h1 className="page-title">Profile</h1>
          <button
            className="edit-btn"
            onClick={isEditing ? handleSave : handleEdit}
          >
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Profile Picture */}
        <div className="profile-picture-section">
          <div className="profile-avatar-large">
            <div className="avatar-circle">RS</div>
          </div>
          {isEditing && (
            <button className="change-photo-btn">Change Photo</button>
          )}
        </div>

        {/* Profile Information */}
        <div className="profile-info-section">
          <div className="form-group">
            <label>Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                className="form-input"
              />
            ) : (
              <div className="form-value">{profileData.name}</div>
            )}
          </div>

          <div className="form-group">
            <label>Email</label>
            {isEditing ? (
              <input
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                className="form-input"
              />
            ) : (
              <div className="form-value">{profileData.email}</div>
            )}
          </div>

          <div className="form-group">
            <label>Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                className="form-input"
              />
            ) : (
              <div className="form-value">{profileData.phone}</div>
            )}
          </div>

          <div className="form-group">
            <label>Location</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.location}
                onChange={(e) =>
                  setProfileData({ ...profileData, location: e.target.value })
                }
                className="form-input"
              />
            ) : (
              <div className="form-value">{profileData.location}</div>
            )}
          </div>

          <div className="form-group">
            <label>Preferred Language</label>
            {isEditing ? (
              <select
                value={profileData.language}
                onChange={(e) =>
                  setProfileData({ ...profileData, language: e.target.value })
                }
                className="form-input"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            ) : (
              <div className="form-value">{profileData.language}</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="action-buttons">
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        )}

        {/* Additional Options */}
        <div className="additional-options">
          <button className="option-btn">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 1v6m0 0l4-4m-4 4L8 3m8 15v6m0 0l4-4m-4 4l-4-4" />
              <path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0z" />
            </svg>
            <span>Change Password</span>
          </button>

          <button className="option-btn">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10,17 15,12 10,7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
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
