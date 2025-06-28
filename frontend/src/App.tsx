import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserRoutes } from "./routes/UserRoutes";
import { AdminRoutes } from "./routes/AdminRoutes";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* User Routes - All routes starting with /user/ */}
          <Route path="/user/*" element={<UserRoutes />} />

          {/* Admin Routes - All other routes */}
          <Route path="/*" element={<AdminRoutes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
