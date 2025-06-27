import React from "react";
import { Routes, Route } from "react-router-dom";
import { MobileLeadsPage } from "../pages/MobileLeadsPage";
import { MobileSchedulePage } from "../pages/MobileSchedulePage";
import { MobileProfilePage } from "../pages/MobileProfilePage";

export const MobileRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MobileLeadsPage />} />
      <Route path="/leads" element={<MobileLeadsPage />} />
      <Route path="/schedule" element={<MobileSchedulePage />} />
      <Route path="/profile" element={<MobileProfilePage />} />
      {/* Default redirect to leads for unknown mobile routes */}
      <Route path="*" element={<MobileLeadsPage />} />
    </Routes>
  );
};
