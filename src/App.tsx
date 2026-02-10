import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import RequestVehicle from "./pages/RequestVehicle";
import InternalMovement from "./pages/InternalMovement";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";

function App() {
  const [view, setView] = useState("landing");

  // Handle main app page switching (sidebar navigation)
  const handlePageChange = (page: string) => {
    setView(page);
  };

  const renderContent = () => {
    switch (view) {
      case "landing":
        return <LandingPage onSelectOption={(opt) => setView(opt)} />;
      case "request_vehicle":
        return <RequestVehicle onBack={() => setView("landing")} />;
      case "internal_movement":
        return <InternalMovement onBack={() => setView("landing")} />;
      case "dashboard":
        return (
          <Layout currentPage="dashboard" onPageChange={handlePageChange}>
            <Dashboard />
          </Layout>
        );
      case "vehicles":
        return (
          <Layout currentPage="vehicles" onPageChange={handlePageChange}>
            <Vehicles />
          </Layout>
        );
      case "drivers":
        return (
          <Layout currentPage="drivers" onPageChange={handlePageChange}>
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 italic">
              Driver management coming soon...
            </div>
          </Layout>
        );
      case "trips":
        return (
          <Layout currentPage="trips" onPageChange={handlePageChange}>
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 italic">
              Trip tracking module coming soon...
            </div>
          </Layout>
        );
      case "settings":
        return (
          <Layout currentPage="settings" onPageChange={handlePageChange}>
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 italic">
              App settings coming soon...
            </div>
          </Layout>
        );
      default:
        return <LandingPage onSelectOption={(opt) => setView(opt)} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderContent()}
    </div>
  );
}

export default App;
