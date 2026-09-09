import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const HomeRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={user.role === "manager" ? "/team-dashboard" : "/my-reports"}
      replace
    />
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected pages */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Home */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Member pages */}
            <Route path="/my-reports" element={<div>My Reports</div>} />
            <Route path="/my-reports/new" element={<div>New Report</div>} />

            {/* Shared report page */}
            <Route path="/reports/:id" element={<div>Report Details</div>} />

            {/* Manager pages */}
            <Route
              path="/team-dashboard"
              element={
                <ProtectedRoute role="manager">
                  <div>Team Dashboard</div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/team-reports"
              element={
                <ProtectedRoute role="manager">
                  <div>Team Reports</div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects"
              element={
                <ProtectedRoute role="manager">
                  <div>Projects</div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/team"
              element={
                <ProtectedRoute role="manager">
                  <div>Team Members</div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/team/:userId"
              element={
                <ProtectedRoute role="manager">
                  <div>Team Member Profile</div>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Unknown pages */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;