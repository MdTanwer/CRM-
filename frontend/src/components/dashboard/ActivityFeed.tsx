import React, { useEffect, useState } from "react";
import socketService from "../../services/socketService";
import type { RealtimeActivity } from "../../services/socketService";
import {
  getRecentActivities,
  getUserType,
} from "../../services/activities.service";
import {
  ACTIVITY_TYPE_COLORS,
  ACTIVITY_PRIORITY_COLORS,
} from "../../constants";
import "../../styles/dashboard.css";

interface ActivityFeedProps {
  activities?: RealtimeActivity[];
  limit?: number;
  userType?: "admin" | "employee";
  showPriority?: boolean;
  token?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities: initialActivities,
  limit = 10,
  userType,
  showPriority = false,
  token,
}) => {
  const [activities, setActivities] = useState<RealtimeActivity[]>(
    initialActivities || []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [resolvedUserType, setResolvedUserType] = useState<
    "admin" | "employee"
  >(userType || "employee");

  // Determine user type if not provided
  useEffect(() => {
    const determineUserType = async () => {
      if (userType) {
        setResolvedUserType(userType);
        return;
      }

      // Try to get user info from localStorage or token
      try {
        const userData = localStorage.getItem("user_data");
        if (userData) {
          const user = JSON.parse(userData);
          const detectedType = getUserType(user);
          setResolvedUserType(detectedType);
          console.log("Detected user type:", detectedType);
        }
      } catch (error) {
        console.warn("Could not determine user type, defaulting to employee");
        setResolvedUserType("employee");
      }
    };

    determineUserType();
  }, [userType]);

  // Fetch activities from API
  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!token) {
        console.warn("No token provided, skipping API call");
        setError("Authentication required");
        return;
      }

      const fetchedActivities = await getRecentActivities(
        token,
        limit,
        resolvedUserType
      );
      setActivities(fetchedActivities);
      console.log(`Fetched ${resolvedUserType} activities:`, fetchedActivities);
    } catch (error: any) {
      console.error("Failed to fetch activities:", error);
      setError("Failed to load recent activities");

      // Fallback to dummy data if provided
      if (initialActivities && initialActivities.length > 0) {
        setActivities(initialActivities);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize activities
  useEffect(() => {
    if (token && resolvedUserType) {
      fetchActivities();
    }
  }, [token, resolvedUserType, limit]);

  // Socket connection and event handling
  useEffect(() => {
    // Initialize socket connection
    socketService.connect({
      userId: "system",
      userName: "System User",
      userType: resolvedUserType,
    });

    // Subscribe to appropriate activity updates based on user type
    let unsubscribeActivity: (() => void) | undefined;

    if (resolvedUserType === "admin") {
      // Admin users see both admin and employee activities
      unsubscribeActivity = socketService.onActivityUpdate(
        (newActivity: RealtimeActivity) => {
          console.log("Admin received activity update:", newActivity);
          handleNewActivity(newActivity);
        }
      );
    } else {
      // Employee users see employee activities
      unsubscribeActivity = socketService.onEmployeeActivityUpdate(
        (newActivity: RealtimeActivity) => {
          console.log("Employee received activity update:", newActivity);
          handleNewActivity(newActivity);
        }
      );
    }

    // Subscribe to connection status
    const unsubscribeConnection = socketService.onConnectionChange(
      (connected: boolean) => {
        setIsConnected(connected);
        if (connected) {
          console.log(`Socket connected - ActivityFeed (${resolvedUserType})`);
        } else {
          console.log(
            `Socket disconnected - ActivityFeed (${resolvedUserType})`
          );
        }
      }
    );

    // Initial connection status
    setIsConnected(socketService.isConnected());

    // Cleanup on unmount
    return () => {
      if (unsubscribeActivity) unsubscribeActivity();
      unsubscribeConnection();
    };
  }, [resolvedUserType]);

  // Handle new activity from socket
  const handleNewActivity = (newActivity: RealtimeActivity) => {
    setActivities((prevActivities) => {
      // Add new activity to the beginning and limit to specified count
      const updatedActivities = [newActivity, ...prevActivities].slice(
        0,
        limit
      );
      return updatedActivities;
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchActivities();
  };

  // Get activity color based on type
  const getActivityColor = (type: string): string => {
    return (ACTIVITY_TYPE_COLORS as any)[type] || "#6B7280";
  };

  // Get priority color for admin activities
  const getPriorityColor = (priority?: string): string => {
    if (!priority) return "#6B7280";
    return (ACTIVITY_PRIORITY_COLORS as any)[priority] || "#6B7280";
  };

  // Format activity display
  const formatActivityDisplay = (activity: RealtimeActivity) => {
    const isAdminActivity = activity.userType === "admin";

    return (
      <div key={activity.id} className="activity-item">
        <div
          className="activity-dot"
          style={{
            backgroundColor: getActivityColor(activity.type),
          }}
        ></div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <p className="activity-text">{activity.message}</p>
            {showPriority && isAdminActivity && activity.priority && (
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  backgroundColor: getPriorityColor(activity.priority),
                  color: "white",
                  fontWeight: "500",
                  textTransform: "uppercase",
                }}
              >
                {activity.priority}
              </span>
            )}
            {activity.userType && (
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  backgroundColor:
                    activity.userType === "admin" ? "#3B82F6" : "#10B981",
                  color: "white",
                  fontWeight: "500",
                  textTransform: "uppercase",
                }}
              >
                {activity.userType}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              {activity.timeAgo}
            </span>
            {activity.userName && (
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                by {activity.userName}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="activity-section">
      <div className="activity-header">
        <h3 className="activity-title">
          Recent Activity -{" "}
          {resolvedUserType === "admin"
            ? "All Activities"
            : "Employee Activities"}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Connection status indicator */}
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: isConnected ? "#10b981" : "#ef4444",
            }}
            title={
              isConnected
                ? "Connected to real-time updates"
                : "Disconnected from real-time updates"
            }
          ></div>

          {/* User type indicator */}
          <span
            style={{
              fontSize: "10px",
              padding: "2px 6px",
              borderRadius: "4px",
              backgroundColor:
                resolvedUserType === "admin" ? "#3B82F6" : "#10B981",
              color: "white",
              fontWeight: "500",
              textTransform: "uppercase",
            }}
          >
            {resolvedUserType}
          </span>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="refresh-button"
            style={{
              background: "none",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              padding: "4px 8px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "12px",
              color: "#6b7280",
            }}
          >
            {isLoading ? "⟳" : "↻"}
          </button>
        </div>
      </div>

      <div className="activity-list">
        {isLoading && activities.length === 0 ? (
          <div
            className="activity-item"
            style={{ textAlign: "center", color: "#6b7280" }}
          >
            <div className="activity-text">Loading activities...</div>
          </div>
        ) : error && activities.length === 0 ? (
          <div
            className="activity-item"
            style={{ textAlign: "center", color: "#ef4444" }}
          >
            <div className="activity-text">{error}</div>
          </div>
        ) : activities.length === 0 ? (
          <div
            className="activity-item"
            style={{ textAlign: "center", color: "#6b7280" }}
          >
            <div className="activity-text">No recent activities</div>
          </div>
        ) : (
          activities.map(formatActivityDisplay)
        )}
      </div>

      {/* Footer info */}
      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid #f3f4f6",
          fontSize: "12px",
          color: "#6b7280",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          {isConnected
            ? "Real-time updates active"
            : "Real-time updates inactive"}
        </span>
        <span>
          Showing {activities.length} activities ({resolvedUserType})
        </span>
      </div>
    </div>
  );
};
