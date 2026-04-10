import React from "react";

const CARDS = [
  { key: "total",      label: "Total",       icon: "📍", bg: "rgba(99,102,241,.15)",  color: "#a78bfa" },
  { key: "pending",    label: "Pending",     icon: "⏳", bg: "rgba(251,191,36,.15)",  color: "#fbbf24" },
  { key: "inProgress", label: "In Progress", icon: "🔧", bg: "rgba(59,130,246,.15)",  color: "#60a5fa" },
  { key: "cleaned",    label: "Cleaned",     icon: "✅", bg: "rgba(34,197,94,.15)",   color: "#4ade80" },
];

export default function Dashboard({ stats }) {
  return (
    <div className="dashboard">
      {CARDS.map(({ key, label, icon, bg, color }) => (
        <div key={key} className="stat-card">
          <div className="stat-icon" style={{ background: bg }}>{icon}</div>
          <div>
            <div className="stat-num" style={{ color }}>{stats[key] ?? 0}</div>
            <div className="stat-label">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
