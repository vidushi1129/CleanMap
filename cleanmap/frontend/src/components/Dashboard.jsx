import React from "react";
import { useLang } from "../i18n/LanguageContext";

const CARDS = [
  { key: "total",        labelKey: "total",        iconChar: "T", bg: "rgba(99,102,241,.15)",  color: "#a78bfa" },
  { key: "pending",      labelKey: "pending",      iconChar: "P", bg: "rgba(251,191,36,.15)",  color: "#fbbf24" },
  { key: "inProgress",   labelKey: "inProgress",   iconChar: "A", bg: "rgba(59,130,246,.15)",  color: "#60a5fa" },
  { key: "cleaned",      labelKey: "cleaned",      iconChar: "C", bg: "rgba(34,197,94,.15)",   color: "#4ade80" },
  { key: "pendingProof", labelKey: "pendingProof",  iconChar: "?", bg: "rgba(168,85,247,.15)", color: "#c084fc" },
];

export default function Dashboard({ stats }) {
  const { t } = useLang();

  return (
    <div className="dashboard">
      {CARDS.map(({ key, labelKey, iconChar, bg, color }) => (
        <div key={key} className="stat-card">
          <div className="stat-icon" style={{ background: bg, color, fontWeight: 700, fontSize: 16 }}>{iconChar}</div>
          <div>
            <div className="stat-num" style={{ color }}>{stats[key] ?? 0}</div>
            <div className="stat-label">{t(labelKey)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
