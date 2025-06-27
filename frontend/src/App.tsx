import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MobileRoutes } from "./routes/MobileRoutes";
import { DesktopRoutes } from "./routes/DesktopRoutes";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Mobile Routes - All routes starting with /mobile/ */}
          <Route path="/mobile/*" element={<MobileRoutes />} />

          {/* Desktop/Laptop Routes - All other routes */}
          <Route path="/*" element={<DesktopRoutes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
