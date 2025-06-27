import React from "react";
import { Routes, Route } from "react-router-dom";
import { UserDashboardPage } from "../pages/UserDashboardPage";
import { UserLeadsPage } from "../pages/UserLeadsPage";
import { UserSchedulePage } from "../pages/UserSchedulePage";
import { UserProfilePage } from "../pages/UserProfilePage";

export const UserRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<UserDashboardPage />} />
      <Route path="/leads" element={<UserLeadsPage />} />
      <Route path="/schedule" element={<UserSchedulePage />} />
      <Route path="/profile" element={<UserProfilePage />} />
      {/* Default redirect to dashboard for unknown user routes */}
      <Route path="*" element={<UserDashboardPage />} />
    </Routes>
  );
};
