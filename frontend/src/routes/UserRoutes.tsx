import React from "react";
import { Routes, Route } from "react-router-dom";
import { UserDashboardPage } from "../pages/UserDashboardPage";
import { UserLeadsPage } from "../pages/UserLeadsPage";
import { UserSchedulePage } from "../pages/UserSchedulePage";
import { UserProfilePage } from "../pages/UserProfilePage";
import { NotFoundPage } from "../pages/NotFoundPage";

export const UserRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<UserDashboardPage />} />
      <Route path="/leads" element={<UserLeadsPage />} />
      <Route path="/schedule" element={<UserSchedulePage />} />
      <Route path="/profile" element={<UserProfilePage />} />
      {/* 404 page for unknown routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
