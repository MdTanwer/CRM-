import React, { useEffect, useState } from "react";
import socketService from "../../services/socketService";
import type { RealtimeActivity } from "../../services/socketService";
import axios from "axios";
import "../../styles/dashboard.css";

interface ActivityFeedProps {
  activities?: RealtimeActivity[];
  limit?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities: initialActivities,
  limit = 10,
}) => {
  const [activities, setActivities] = useState<RealtimeActivity[]>(
    initialActivities || []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Fetch activities from API - only last 24 hours
  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(
        `http://localhost:3000/api/v1/activities/recent`,
        {
          params: {
            limit: limit,
            days: 1, // Changed to 1 day (24 hours)
          },
        }
      );

      if (response.data && response.data.status === "success") {
        setActivities(response.data.data.activities || []);
      }
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

  useEffect(() => {
    // Initialize socket connection
    socketService.connect({
      userId: "admin",
      userName: "Admin User",
      userType: "admin",
    });

    // Fetch initial activities
    fetchActivities();

    // Subscribe to real-time activity updates
    const unsubscribeActivity = socketService.onActivityUpdate(
      (newActivity: RealtimeActivity) => {
        console.log("Received new activity:", newActivity);

        setActivities((prevActivities) => {
          // Add new activity to the beginning and limit to specified count
          const updatedActivities = [newActivity, ...prevActivities].slice(
            0,
            limit
          );
          return updatedActivities;
        });
      }
    );

    // Subscribe to connection status
    const unsubscribeConnection = socketService.onConnectionChange(
      (connected: boolean) => {
        setIsConnected(connected);
        if (connected) {
          console.log("Socket connected - ActivityFeed");
        } else {
          console.log("Socket disconnected - ActivityFeed");
        }
      }
    );

    // Initial connection status
    setIsConnected(socketService.isConnected());

    // Cleanup on unmount
    return () => {
      unsubscribeActivity();
      unsubscribeConnection();
    };
  }, [limit, initialActivities]);

  // Handle refresh
  const handleRefresh = () => {
    fetchActivities();
  };

  return (
    <div className="activity-section">
      <div className="activity-header">
        <h3 className="activity-title">Recent Activity (Last 24 Hours)</h3>
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
            <div className="activity-text">
              No activities in the last 24 hours
            </div>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div
                className="activity-dot"
                style={{
                  backgroundColor: getActivityColor(activity.type),
                }}
              ></div>
              <div style={{ flex: 1 }}>
                <p className="activity-text">{activity.message}</p>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                  {activity.timeAgo}
                </span>
              </div>
            </div>
          ))
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
        <span>Showing {activities.length} activities (24h)</span>
      </div>
    </div>
  );
};

// Helper function to get activity color based on type
function getActivityColor(type: string): string {
  switch (type) {
    case "employee_added":
      return "#3b82f6"; // Blue
    case "employee_deleted":
      return "#ef4444"; // Red
    case "employee_edited":
      return "#f97316"; // Orange
    case "profile_updated":
      return "#8b5cf6"; // Purple
    case "lead_assigned":
      return "#10b981"; // Green
    case "lead_status_changed":
      return "#f59e0b"; // Amber
    case "deal_closed":
      return "#10b981"; // Green
    case "call_scheduled":
      return "#8b5cf6"; // Purple
    case "lead_created":
      return "#06b6d4"; // Cyan
    default:
      return "#6b7280"; // Gray
  }
}
