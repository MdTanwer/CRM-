import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserRoutes } from "./routes/UserRoutes";
import { DesktopRoutes } from "./routes/DesktopRoutes";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* User Routes - All routes starting with /user/ */}
          <Route path="/user/*" element={<UserRoutes />} />

          {/* Desktop/Laptop Routes - All other routes */}
          <Route path="/*" element={<DesktopRoutes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
