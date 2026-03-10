import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RequestVehicle from "./pages/RequestVehicle";
import InternalMovement from "./pages/InternalMovement";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import Trips from "./pages/Trips";
import NotificationPage from "./pages/Notifications";
import Requests from "./pages/Requests";
import LoginPage from "./pages/LoginPage";
import Settings from "./pages/Settings";
import DriverPerformance from "./pages/DriverPerformance";
import AuditLogs from "./pages/AuditLogs";
import FuelManagement from "./pages/FuelManagement";
import InternalMovementLogs from "./pages/InternalMovementLogs";
import Maintenance from "./pages/Maintenance";
import Reports from "./pages/Reports";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleLogin = (userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/request-vehicle" element={<RequestVehicle />} />
          <Route path="/internal-movement" element={<InternalMovement />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route element={<Layout user={user} onLogout={handleLogout} />}>
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/requests" element={<Requests user={user} />} />
              <Route path="/vehicles" element={<Vehicles user={user} />} />
              <Route path="/drivers" element={<Drivers user={user} />} />
              <Route path="/driver-performance" element={<DriverPerformance user={user} />} />
              <Route path="/audit-logs" element={<AuditLogs user={user} />} />
              <Route path="/trips" element={<Trips user={user} />} />
              <Route path="/internal-logs" element={<InternalMovementLogs user={user} />} />
              <Route path="/fuel" element={<FuelManagement user={user} />} />
              <Route path="/maintenance" element={<Maintenance user={user} />} />
              <Route path="/reports" element={<Reports user={user} />} />
              <Route path="/notifications" element={<NotificationPage />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
