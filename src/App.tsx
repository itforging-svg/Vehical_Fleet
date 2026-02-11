import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import RequestVehicle from "./pages/RequestVehicle";
import InternalMovement from "./pages/InternalMovement";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import Trips from "./pages/Trips";
import NotificationPage from "./pages/Notifications";
import LoginPage from "./pages/LoginPage";

function App() {
  const [view, setView] = useState("landing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Handle main app page switching (sidebar navigation)
  const handlePageChange = (page: string) => {
    if (page === "logout") {
      setIsAuthenticated(false);
      setView("landing");
      return;
    }
    setView(page);
  };

  const handleAdminAccess = () => {
    if (isAuthenticated) {
      setView("dashboard");
    } else {
      setView("login");
    }
  };

  const renderContent = () => {
    switch (view) {
      case "landing":
        return <LandingPage onSelectOption={(opt) => {
          if (opt === "dashboard") {
            handleAdminAccess();
          } else {
            setView(opt);
          }
        }} />;
      case "login":
        return (
          <LoginPage
            onLogin={() => {
              setIsAuthenticated(true);
              setView("dashboard");
            }}
            onBack={() => setView("landing")}
          />
        );
      case "request_vehicle":
        return <RequestVehicle onBack={() => setView("landing")} />;
      case "internal_movement":
        return <InternalMovement onBack={() => setView("landing")} />;
      case "dashboard":
        return isAuthenticated ? (
          <Layout currentPage="dashboard" onPageChange={handlePageChange}>
            <Dashboard />
          </Layout>
        ) : (
          <LoginPage onLogin={() => { setIsAuthenticated(true); setView("dashboard"); }} onBack={() => setView("landing")} />
        );
      case "vehicles":
        return isAuthenticated ? (
          <Layout currentPage="vehicles" onPageChange={handlePageChange}>
            <Vehicles />
          </Layout>
        ) : (
          <LoginPage onLogin={() => { setIsAuthenticated(true); setView("vehicles"); }} onBack={() => setView("landing")} />
        );
      case "drivers":
        return isAuthenticated ? (
          <Layout currentPage="drivers" onPageChange={handlePageChange}>
            <Drivers />
          </Layout>
        ) : (
          <LoginPage onLogin={() => { setIsAuthenticated(true); setView("drivers"); }} onBack={() => setView("landing")} />
        );
      case "trips":
        return isAuthenticated ? (
          <Layout currentPage="trips" onPageChange={handlePageChange}>
            <Trips />
          </Layout>
        ) : (
          <LoginPage onLogin={() => { setIsAuthenticated(true); setView("trips"); }} onBack={() => setView("landing")} />
        );
      case "notifications":
        return isAuthenticated ? (
          <Layout currentPage="notifications" onPageChange={handlePageChange}>
            <NotificationPage />
          </Layout>
        ) : (
          <LoginPage onLogin={() => { setIsAuthenticated(true); setView("notifications"); }} onBack={() => setView("landing")} />
        );
      case "settings":
        return isAuthenticated ? (
          <Layout currentPage="settings" onPageChange={handlePageChange}>
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 italic">
              App settings coming soon...
            </div>
          </Layout>
        ) : (
          <LoginPage onLogin={() => { setIsAuthenticated(true); setView("settings"); }} onBack={() => setView("landing")} />
        );
      default:
        return <LandingPage onSelectOption={(opt) => {
          if (opt === "dashboard") {
            handleAdminAccess();
          } else {
            setView(opt);
          }
        }} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderContent()}
    </div>
  );
}

export default App;
