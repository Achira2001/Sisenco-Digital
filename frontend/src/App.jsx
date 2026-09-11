import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyReportsPage from "./pages/MyReportsPage";
import ReportFormPage from "./pages/ReportFormPage";
import ReportDetailPage from "./pages/ReportDetailPage";
import TeamDashboardPage from "./pages/TeamDashboardPage";
import TeamReportsPage from "./pages/TeamReportsPage";
import ProjectsPage from "./pages/ProjectsPage";
import TeamMembersPage from "./pages/TeamMembersPage";
import TeamMemberProfilePage from "./pages/TeamMemberProfilePage";

// "/" has no real page of its own - it just redirects to the right
// home page depending on whether the logged-in user is a member or manager.
const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "manager" ? "/team-dashboard" : "/my-reports"} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<HomeRedirect />} />

            {/* Member pages */}
            <Route path="/my-reports" element={<ProtectedRoute role="member"><MyReportsPage /></ProtectedRoute>} />
            <Route path="/my-reports/new" element={<ProtectedRoute role="member"><ReportFormPage /></ProtectedRoute>} />

            {/* Shared: report detail (view/edit for owner, review for manager) */}
            <Route path="/reports/:id" element={<ReportDetailPage />} />

            {/* Manager pages */}
            <Route path="/team-dashboard" element={<ProtectedRoute role="manager"><TeamDashboardPage /></ProtectedRoute>} />
            <Route path="/team-reports" element={<ProtectedRoute role="manager"><TeamReportsPage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute role="manager"><ProjectsPage /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute role="manager"><TeamMembersPage /></ProtectedRoute>} />
            <Route path="/team/:userId" element={<ProtectedRoute role="manager"><TeamMemberProfilePage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
