import React, { useState } from "react";
import { useLang } from "../i18n/LanguageContext";

export default function Leaderboard({ leaderboard }) {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(false);

  const displayList = expanded ? leaderboard : leaderboard.slice(0, 5);

  return (
    <div className="leaderboard-panel">
      <div className="lb-header" onClick={() => setExpanded(v => !v)}>
        <span className="lb-title">{t("leaderboard")}</span>
        <span className="lb-toggle">{expanded ? "▲" : "▼"}</span>
      </div>

      {leaderboard.length === 0 ? (
        <div className="lb-empty">{t("noVolunteers")}</div>
      ) : (
        <div className={`lb-body ${expanded ? "lb-expanded" : ""}`}>
          <table className="lb-table">
            <thead>
              <tr>
                <th>{t("rank")}</th>
                <th>{t("volunteer")}</th>
                <th>{t("cleanups")}</th>
                <th>{t("totalScore")}</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map((v, i) => (
                <tr key={v.name} className={i < 3 ? `lb-top-${i + 1}` : ""}>
                  <td className="lb-rank">{v.rank}</td>
                  <td className="lb-name">{v.name}</td>
                  <td className="lb-cleanups">{v.cleanups}</td>
                  <td className="lb-score">
                    <span className="lb-score-badge">{v.score} {t("pts")}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!expanded && leaderboard.length > 5 && (
            <button className="lb-show-more" onClick={(e) => { e.stopPropagation(); setExpanded(true); }}>
              Show all {leaderboard.length} volunteers
            </button>
          )}
        </div>
      )}
    </div>
  );
}
