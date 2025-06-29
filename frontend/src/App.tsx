import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserRoutes } from "./routes/UserRoutes";
import { AdminRoutes } from "./routes/AdminRoutes";
import { AppProviders } from "./context/AppProviders";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <AppProviders>
      <Router>
        <div className="app">
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* User Routes - All routes starting with /user/ */}
            <Route path="/user/*" element={<UserRoutes />} />

            {/* Admin Routes - All other routes */}
            <Route path="/*" element={<AdminRoutes />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AppProviders>
  );
}

export default App;
