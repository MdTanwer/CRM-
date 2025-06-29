import React from "react";
import { Routes, Route } from "react-router-dom";
import { UserDashboardPage } from "../pages/UserDashboardPage";
import { UserLeadsPage } from "../pages/UserLeadsPage";
import { UserSchedulePage } from "../pages/UserSchedulePage";
import { UserProfilePage } from "../pages/UserProfilePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import ProtectedRoute from "../components/ProtectedRoute";

export const UserRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
        <Route path="/" element={<UserDashboardPage />} />
        <Route path="/leads" element={<UserLeadsPage />} />
        <Route path="/schedule" element={<UserSchedulePage />} />
        <Route path="/profile" element={<UserProfilePage />} />
      </Route>
      {/* 404 page for unknown routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
