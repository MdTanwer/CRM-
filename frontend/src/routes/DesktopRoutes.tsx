import React from "react";
import { Routes, Route } from "react-router-dom";
import { Dashboard } from "../pages/Dashboard";
import { LeadsPage } from "../pages/LeadsPage";
import { EmployeesPage } from "../pages/EmployeesPage";
import { SettingsPage } from "../pages/SettingsPage";
import { ROUTES } from "../constants";
import { NotFoundPage } from "../pages/NotFoundPage";
export const DesktopRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
      <Route path={ROUTES.LEADS} element={<LeadsPage />} />
      <Route path={ROUTES.EMPLOYEES} element={<EmployeesPage />} />
      <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
      {/* Future desktop routes can be added here */}

      {/* 404 page for unknown routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
