import React, { useState, useCallback, useEffect } from "react";
import Dashboard     from "./components/Dashboard";
import MapView       from "./components/MapView";
import ReportForm    from "./components/ReportForm";
import Sidebar       from "./components/Sidebar";
import Toast         from "./components/Toast";
import Leaderboard   from "./components/Leaderboard";
import LanguageToggle from "./components/LanguageToggle";
import { useReports } from "./hooks/useReports";
import { useLang }   from "./i18n/LanguageContext";
import "./App.css";

export default function App() {
  const { reports, stats, leaderboard, loading, error, refresh } = useReports();
  const { t } = useLang();
  const [showForm,  setShowForm]  = useState(false);
  const [pinCoords, setPinCoords] = useState(null);
  const [toast,     setToast]     = useState("");
  const [userLoc,   setUserLoc]   = useState(null);
  const [showLB,    setShowLB]    = useState(false);

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
    setToast(t("reportSuccess"));
  }, [refresh, t]);

  if (loading) return <div className="loader">{t("loadingApp")}</div>;

  return (
    <div className="app">
      <header className="topbar">
        <div className="logo">{t("appName")}</div>
        <div className="topbar-center">
          {error && (
            <span style={{ fontSize: 12, color: "#f87171" }}>
              {t("apiError")} — {error}
            </span>
          )}
        </div>
        <div className="topbar-actions">
          <LanguageToggle />
          <button
            className="lb-btn-topbar"
            onClick={() => setShowLB(v => !v)}
            title={t("leaderboard")}
          >
            LB
          </button>
          <button
            className="report-btn"
            onClick={() => { setPinCoords(null); setShowForm(true); }}
          >
            {t("reportSpot")}
          </button>
        </div>
      </header>

      <Dashboard stats={stats} />

      {/* Leaderboard slide-out panel */}
      {showLB && (
        <div className="lb-overlay" onClick={(e) => e.target === e.currentTarget && setShowLB(false)}>
          <div className="lb-slide">
            <Leaderboard leaderboard={leaderboard} />
          </div>
        </div>
      )}

      <div className="main">
        <MapView
          reports={reports}
          onMapClick={handleMapClick}
          onRefresh={refresh}
          leaderboard={leaderboard}
        />
        <Sidebar
          reports={reports}
          onRefresh={refresh}
          userLocation={userLoc}
          leaderboard={leaderboard}
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
