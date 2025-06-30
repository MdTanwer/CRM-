import React, { useState } from "react";
import axios from "axios";
import socketService from "../../services/socketService";

export const AddEmployeeDemo: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");

  const handleAddEmployee = async () => {
    setIsSubmitting(true);
    setMessage("");

    try {
      // Generate random employee data for demo
      const randomId = Math.floor(Math.random() * 10000);
      const firstNames = [
        "John",
        "Jane",
        "Mike",
        "Sarah",
        "David",
        "Lisa",
        "Alex",
        "Emily",
      ];
      const lastNames = [
        "Smith",
        "Johnson",
        "Williams",
        "Brown",
        "Jones",
        "Garcia",
        "Miller",
        "Davis",
      ];
      const locations = [
        "New York",
        "Los Angeles",
        "Chicago",
        "Houston",
        "Phoenix",
      ];
      const languages = ["English", "Spanish", "French", "German"];

      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      const employeeData = {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomId}@example.com`,
        employeeId: `EMP${randomId}`,
        location: locations[Math.floor(Math.random() * locations.length)],
        preferredLanguage:
          languages[Math.floor(Math.random() * languages.length)],
        assignedLeads: Math.floor(Math.random() * 10),
        closedLeads: Math.floor(Math.random() * 5),
        status: "active",
        avatarUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
      };

      // Add employee via API
      const response = await axios.post(
        "http://localhost:3000/api/v1/employees",
        employeeData
      );

      if (response.data && response.data.status === "success") {
        setMessage(`✅ Successfully added employee: ${firstName} ${lastName}`);

        // The real-time activity should be automatically broadcasted from the backend
        // But we can also emit it manually if needed
        // socketService.emitEmployeeAdded(response.data.data.employee);
      } else {
        setMessage("❌ Failed to add employee");
      }
    } catch (error: any) {
      console.error("Error adding employee:", error);
      setMessage(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerCustomActivity = () => {
    // Emit a custom activity for testing
    socketService.emitCustomActivity({
      id: `custom_${Date.now()}`,
      message: "Admin performed a custom action for testing",
      timeAgo: "Just now",
      type: "custom_action",
      timestamp: new Date().toISOString(),
      metadata: {
        action: "test_activity",
        source: "demo_component",
      },
    });
    setMessage("📤 Custom activity sent!");
  };

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "20px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        margin: "20px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>
        🧪 Real-time Activity Demo
      </h3>

      <p style={{ color: "#6b7280", marginBottom: "20px", fontSize: "14px" }}>
        Test the real-time activity system by adding employees or triggering
        custom activities. Watch the Activity Feed update in real-time!
      </p>

      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <button
          onClick={handleAddEmployee}
          disabled={isSubmitting}
          style={{
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.6 : 1,
            transition: "all 0.2s",
          }}
        >
          {isSubmitting ? "Adding..." : "➕ Add Random Employee"}
        </button>

        <button
          onClick={handleTriggerCustomActivity}
          style={{
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          🚀 Send Custom Activity
        </button>
      </div>

      {message && (
        <div
          style={{
            padding: "12px",
            borderRadius: "6px",
            backgroundColor: message.includes("✅")
              ? "#d1fae5"
              : message.includes("📤")
              ? "#dbeafe"
              : "#fee2e2",
            color: message.includes("✅")
              ? "#065f46"
              : message.includes("📤")
              ? "#1e40af"
              : "#991b1b",
            fontSize: "14px",
            marginTop: "12px",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          marginTop: "20px",
          padding: "12px",
          backgroundColor: "#f9fafb",
          borderRadius: "6px",
          fontSize: "13px",
          color: "#6b7280",
        }}
      >
        <strong>How it works:</strong>
        <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
          <li>
            When you add an employee, the backend automatically creates an
            activity
          </li>
          <li>
            Socket.IO broadcasts this activity to all connected clients in
            real-time
          </li>
          <li>
            The Activity Feed component receives and displays the new activity
            instantly
          </li>
          <li>No page refresh needed - everything updates live!</li>
        </ul>
      </div>
    </div>
  );
};
