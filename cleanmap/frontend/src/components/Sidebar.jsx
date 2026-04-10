import React, { useState, useMemo } from "react";
import { timeAgo, distanceKm, SEV_COLOR } from "../utils/helpers";
import { claimReport, cleanReport } from "../api";
import AfterPhotoModal from "./AfterPhotoModal";
import BeforeAfterCard from "./BeforeAfterCard";
import { useLang } from "../i18n/LanguageContext";

export default function Sidebar({ reports, onRefresh, userLocation, leaderboard }) {
  const { t } = useLang();
  const [filter,       setFilter]       = useState("ALL");
  const [sortNearest,  setSortNearest]  = useState(false);
  const [afterModal,   setAfterModal]   = useState(null);
  const [baCard,       setBaCard]       = useState(null);

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
    if (action === "claim") {
      const name = prompt(t("enterNameClaim"));
      if (!name?.trim()) return;
      try {
        await claimReport(id, name.trim());
        onRefresh?.();
      } catch (e) {
        alert("Error: " + e.message);
      }
    } else if (action === "clean") {
      const name = prompt(t("enterNameClean"));
      if (!name?.trim()) return;
      setAfterModal({ id, volunteerName: name.trim() });
    }
  }

  async function handleAfterSubmit(reportId, volunteerName, afterImageUrl) {
    try {
      await cleanReport(reportId, volunteerName, afterImageUrl);
      setAfterModal(null);
      onRefresh?.();
    } catch (e) {
      throw e;
    }
  }

  function getVolunteerScore(name) {
    const entry = leaderboard?.find(v => v.name === name);
    return entry ? entry.score : 0;
  }

  const FILTERS = ["ALL", "PENDING", "IN_PROGRESS", "CLEANED", "PENDING_PROOF"];
  const filterLabels = {
    ALL: t("all"),
    PENDING: t("pending"),
    IN_PROGRESS: t("active"),
    CLEANED: t("cleaned"),
    PENDING_PROOF: t("pendingProof"),
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>{t("liveReports")}</span>
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
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {/* Sort toggle */}
      <div className="sort-bar">
        <span>{t("sort")}</span>
        <button
          className="sort-btn"
          onClick={() => setSortNearest(v => !v)}
          disabled={!userLocation}
          title={!userLocation ? t("enableLocation") : ""}
        >
          {sortNearest ? t("nearestFirst") : t("newestFirst")}
        </button>
      </div>

      {/* Cards */}
      <div className="report-list">
        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#8892a4", fontSize: 13, padding: 24 }}>
            {t("noReportsMatch")}
          </p>
        )}
        {filtered.map(r => {
          const dist = userLocation
            ? distanceKm(userLocation.lat, userLocation.lng, r.lat, r.lng).toFixed(1) + " km"
            : null;
          const volScore = r.claimedBy ? getVolunteerScore(r.claimedBy) : 0;
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
                <span className={`rc-sev sev-${r.severity.toLowerCase()}`}>{t(r.severity.toLowerCase())}</span>
                <span className={`rc-status st-${r.status}`}>
                  {r.status === "PENDING" && t("statusPending")}
                  {r.status === "IN_PROGRESS" && t("statusInProgress")}
                  {r.status === "CLEANED" && t("statusCleaned")}
                  {r.status === "PENDING_PROOF" && t("statusPendingProof")}
                </span>
              </div>
              <div className="rc-desc">{r.description || t("noDescription")}</div>
              <div className="rc-meta">
                {r.location || t("unknown")} {dist && `· ${dist}`}
              </div>
              <div className="rc-meta">{timeAgo(r.timestamp)} · {t("by")} {r.reporter || t("anonymous")}</div>
              {r.claimedBy && (
                <div className="rc-credit">
                  {r.status === "CLEANED" ? t("cleanedBy") : t("claimedBy")} {t("by")} {r.claimedBy}
                  {volScore > 0 && (
                    <span className="rc-vol-score"> · {volScore} {t("pts")}</span>
                  )}
                </div>
              )}

              {/* Before / After button for CLEANED or PENDING_PROOF spots */}
              {(r.status === "CLEANED" || r.status === "PENDING_PROOF") && (r.imageUrl || r.afterImageUrl) && (
                <button
                  className="btn-ba"
                  onClick={() => setBaCard({ beforeUrl: r.imageUrl, afterUrl: r.afterImageUrl })}
                >
                  {t("beforeAfter")}
                </button>
              )}

              <div className="rc-actions">
                {r.status === "PENDING" && (
                  <button className="btn-claim" onClick={() => handleAction(r.id, "claim")}>
                    {t("claim")}
                  </button>
                )}
                {r.status === "IN_PROGRESS" && (
                  <button className="btn-clean" onClick={() => handleAction(r.id, "clean")}>
                    {t("markCleaned")}
                  </button>
                )}
                {r.status === "CLEANED" && (
                  <span className="btn-done">{t("done")}</span>
                )}
                {r.status === "PENDING_PROOF" && (
                  <span className="btn-pending-proof">{t("pendingProofShort")}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* After photo upload modal */}
      {afterModal && (
        <AfterPhotoModal
          reportId={afterModal.id}
          volunteerName={afterModal.volunteerName}
          onSubmit={handleAfterSubmit}
          onClose={() => setAfterModal(null)}
        />
      )}

      {/* Before / After card modal */}
      {baCard && (
        <BeforeAfterCard
          beforeUrl={baCard.beforeUrl}
          afterUrl={baCard.afterUrl}
          onClose={() => setBaCard(null)}
        />
      )}
    </aside>
  );
}
