import React, { useState, useMemo } from "react";
import { timeAgo, distanceKm, SEV_COLOR } from "../utils/helpers";
import { claimReport, cleanReport } from "../api";

export default function Sidebar({ reports, onRefresh, userLocation }) {
  const [filter,     setFilter]     = useState("ALL");
  const [sortNearest, setSortNearest] = useState(false);

  const filtered = useMemo(() => {
    let list = filter === "ALL" ? [...reports] : reports.filter(r => r.status === filter);
    if (sortNearest && userLocation) {
      list.sort((a, b) => {
        const da = distanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const db = distanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return da - db;
      });
    } else {
      list.sort((a, b) => b.timestamp - a.timestamp);
    }
    return list;
  }, [reports, filter, sortNearest, userLocation]);

  async function handleAction(id, action) {
    const name = prompt(
      action === "claim" ? "Enter your name to claim:" : "Enter your name to mark cleaned:"
    );
    if (!name?.trim()) return;
    try {
      if (action === "claim") await claimReport(id, name.trim());
      if (action === "clean") await cleanReport(id, name.trim());
      onRefresh?.();
    } catch (e) {
      alert("Error: " + e.message);
    }
  }

  const FILTERS = ["ALL", "PENDING", "IN_PROGRESS", "CLEANED"];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>Live Reports</span>
        <div className="live-dot" />
      </div>

      {/* Filter tabs */}
      <div className="sidebar-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "IN_PROGRESS" ? "Active" : f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Sort toggle */}
      <div className="sort-bar">
        <span>Sort:</span>
        <button
          className="sort-btn"
          onClick={() => setSortNearest(v => !v)}
          disabled={!userLocation}
          title={!userLocation ? "Enable location to sort by distance" : ""}
        >
          {sortNearest ? "📍 Nearest first" : "🕐 Newest first"}
        </button>
      </div>

      {/* Cards */}
      <div className="report-list">
        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#8892a4", fontSize: 13, padding: 24 }}>
            No reports match this filter.
          </p>
        )}
        {filtered.map(r => {
          const col = SEV_COLOR[r.severity] || "#888";
          const dist = userLocation
            ? distanceKm(userLocation.lat, userLocation.lng, r.lat, r.lng).toFixed(1) + " km"
            : null;
          return (
            <div key={r.id} className={`report-card rc-${r.severity.toLowerCase()}`}>
              {r.imageUrl && (
                <img
                  src={r.imageUrl} alt="waste"
                  className="rc-thumb"
                  onError={e => { e.target.style.display = "none"; }}
                />
              )}
              <div className="rc-top">
                <span className={`rc-sev sev-${r.severity.toLowerCase()}`}>{r.severity}</span>
                <span className={`rc-status st-${r.status}`}>{r.status.replace("_", " ")}</span>
              </div>
              <div className="rc-desc">{r.description || "No description"}</div>
              <div className="rc-meta">
                📍 {r.location || "Unknown"} {dist && `· ${dist}`}
              </div>
              <div className="rc-meta">{timeAgo(r.timestamp)} · by {r.reporter || "Anonymous"}</div>
              {r.claimedBy && (
                <div className="rc-credit">
                  {r.status === "CLEANED" ? "✅ Cleaned" : "🔧 Claimed"} by {r.claimedBy}
                </div>
              )}
              <div className="rc-actions">
                {r.status === "PENDING" && (
                  <button className="btn-claim" onClick={() => handleAction(r.id, "claim")}>
                    🙋 Claim
                  </button>
                )}
                {r.status === "IN_PROGRESS" && (
                  <button className="btn-clean" onClick={() => handleAction(r.id, "clean")}>
                    ✅ Cleaned
                  </button>
                )}
                {r.status === "CLEANED" && (
                  <span className="btn-done">✓ Done</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
