import React, { useState, useCallback, useEffect } from "react";
import Dashboard  from "./components/Dashboard";
import MapView    from "./components/MapView";
import ReportForm from "./components/ReportForm";
import Sidebar    from "./components/Sidebar";
import Toast      from "./components/Toast";
import { useReports } from "./hooks/useReports";
import "./App.css";

export default function App() {
  const { reports, stats, loading, error, refresh } = useReports();
  const [showForm,  setShowForm]  = useState(false);
  const [pinCoords, setPinCoords] = useState(null);
  const [toast,     setToast]     = useState("");
  const [userLoc,   setUserLoc]   = useState(null);

  // Get user location for "nearest first" sort
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((p) =>
      setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude })
    );
  }, []);

  const handleMapClick = useCallback((lat, lng) => {
    setPinCoords({ lat, lng });
    setShowForm(true);
  }, []);

  const handleSuccess = useCallback(() => {
    setShowForm(false);
    setPinCoords(null);
    refresh();
    setToast("✅ Report submitted! Thank you.");
  }, [refresh]);

  if (loading) return <div className="loader">🗺 Loading CleanMap…</div>;

  return (
    <div className="app">
      <header className="topbar">
        <div className="logo">🗺 CleanMap</div>
        {error && (
          <span style={{ fontSize: 12, color: "#f87171" }}>
            ⚠️ API error — {error}
          </span>
        )}
        <button
          className="report-btn"
          onClick={() => { setPinCoords(null); setShowForm(true); }}
        >
          🚨 Report Spot
        </button>
      </header>

      <Dashboard stats={stats} />

      <div className="main">
        <MapView
          reports={reports}
          onMapClick={handleMapClick}
          onRefresh={refresh}
        />
        <Sidebar
          reports={reports}
          onRefresh={refresh}
          userLocation={userLoc}
        />
      </div>

      {showForm && (
        <ReportForm
          pinLat={pinCoords?.lat}
          pinLng={pinCoords?.lng}
          onSuccess={handleSuccess}
          onClose={() => { setShowForm(false); setPinCoords(null); }}
        />
      )}

      <Toast message={toast} onDone={() => setToast("")} />
    </div>
  );
}
