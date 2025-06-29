import React from "react";
import { Routes, Route } from "react-router-dom";
import { AdminDashboard } from "../pages/AdminDashboard";
import { LeadsPage } from "../pages/LeadsPage";
import { EmployeesPage } from "../pages/EmployeesPage";
import { SettingsPage } from "../pages/SettingsPage";
import { ROUTES } from "../constants";
import { NotFoundPage } from "../pages/NotFoundPage";
import LeadsUpload from "../pages/LeadsUpload";

export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
      <Route path={ROUTES.LEADS} element={<LeadsPage />} />
      <Route path={ROUTES.LEADS_UPLOAD} element={<LeadsUpload />} />
      <Route path={ROUTES.EMPLOYEES} element={<EmployeesPage />} />
      <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
      {/* Future admin routes can be added here */}

      {/* 404 page for unknown routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
