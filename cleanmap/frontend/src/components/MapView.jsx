import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SEV_COLOR, timeAgo } from "../utils/helpers";
import { claimReport, cleanReport } from "../api";
import AfterPhotoModal from "./AfterPhotoModal";
import BeforeAfterCard from "./BeforeAfterCard";
import { useLang } from "../i18n/LanguageContext";

function makeIcon(severity, status) {
  const col = SEV_COLOR[severity] || "#888";
  const opacity = status === "CLEANED" ? 0.5 : 1;
  const ring = status === "IN_PROGRESS"
    ? `<circle cx="16" cy="16" r="13" fill="none" stroke="${col}" stroke-width="2.5"
        stroke-dasharray="5 3" opacity="0.9"/>`
    : status === "PENDING_PROOF"
    ? `<circle cx="16" cy="16" r="13" fill="none" stroke="#c084fc" stroke-width="2.5"
        stroke-dasharray="2 4" opacity="0.9"/>`
    : "";
  const pulse = (status === "IN_PROGRESS" || status === "PENDING_PROOF") ? 'class="pulse-marker"' : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42"
      viewBox="0 0 32 42" style="opacity:${opacity}">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 16 26 16 26S32 26.5 32 16C32 7.163 24.837 0 16 0z"
      fill="${col}" stroke="#fff" stroke-width="2"/>
    <circle cx="16" cy="16" r="7" fill="#fff" opacity="0.9"/>
    ${ring}
  </svg>`;
  return L.divIcon({
    html: `<div ${pulse}>${svg}</div>`,
    className: "",
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -44],
  });
}

export default function MapView({ reports, onMapClick, onRefresh, leaderboard }) {
  const { t } = useLang();
  const mapRef   = useRef(null);
  const mapInst  = useRef(null);
  const markers  = useRef({});
  const [afterModal, setAfterModal] = useState(null);
  const [baCard,     setBaCard]     = useState(null);

  function popupHTML(r) {
    const col = SEV_COLOR[r.severity] || "#888";
    const img = r.imageUrl
      ? `<img src="${r.imageUrl}" style="width:100%;height:130px;object-fit:cover;border-radius:8px;
          margin-bottom:10px;display:block" onerror="this.style.display='none'" alt=""/>`
      : "";

    const volScore = r.claimedBy
      ? (leaderboard?.find(v => v.name === r.claimedBy)?.score || 0)
      : 0;
    const scoreTag = volScore > 0
      ? `<span style="margin-left:6px;font-size:10px;background:rgba(234,179,8,.15);color:#fbbf24;padding:1px 6px;border-radius:4px">${volScore} ${t("pts")}</span>`
      : "";

    const credit = r.claimedBy
      ? `<div style="font-size:11px;color:#4ade80;margin-top:4px">
          ${r.status === "CLEANED" ? t("cleanedBy") : t("claimedBy")} ${t("by")} ${r.claimedBy}${scoreTag}</div>`
      : "";

    let statusText = r.status.replace("_", " ");
    if (r.status === "PENDING") statusText = t("statusPending");
    if (r.status === "IN_PROGRESS") statusText = t("statusInProgress");
    if (r.status === "CLEANED") statusText = t("statusCleaned");
    if (r.status === "PENDING_PROOF") statusText = t("statusPendingProof");

    let action = "";
    if (r.status === "PENDING")
      action = `<button data-id="${r.id}" data-action="claim"
        style="background:#3b82f6;color:#fff;border:none;padding:6px 14px;border-radius:6px;
        font-size:12px;font-weight:600;cursor:pointer;margin-top:8px">${t("claimForCleanup")}</button>`;
    if (r.status === "IN_PROGRESS")
      action = `<button data-id="${r.id}" data-action="clean"
        style="background:#16a34a;color:#fff;border:none;padding:6px 14px;border-radius:6px;
        font-size:12px;font-weight:600;cursor:pointer;margin-top:8px">${t("markAsCleaned")}</button>`;
    if (r.status === "CLEANED")
      action = `<span style="display:inline-block;margin-top:8px;padding:4px 10px;
        background:rgba(34,197,94,.15);color:#4ade80;border-radius:6px;font-size:12px">${t("cleaned")}</span>`;
    if (r.status === "PENDING_PROOF")
      action = `<span style="display:inline-block;margin-top:8px;padding:4px 10px;
        background:rgba(168,85,247,.15);color:#c084fc;border-radius:6px;font-size:12px">${t("pendingProofShort")}</span>`;

    let baBtn = "";
    if ((r.status === "CLEANED" || r.status === "PENDING_PROOF") && (r.imageUrl || r.afterImageUrl)) {
      baBtn = `<button data-id="${r.id}" data-action="beforeafter"
        style="background:rgba(99,102,241,.15);color:#a78bfa;border:1px solid rgba(99,102,241,.3);padding:4px 10px;border-radius:6px;
        font-size:11px;font-weight:600;cursor:pointer;margin-top:6px;display:block">${t("beforeAfter")}</button>`;
    }

    return `<div style="font-family:system-ui;min-width:220px;padding:12px">
      ${img}
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="background:${col}22;color:${col};padding:2px 8px;border-radius:4px;
          font-size:11px;font-weight:600">${t(r.severity.toLowerCase())}</span>
        <span style="font-size:11px;color:#8892a4">${statusText}</span>
      </div>
      <p style="font-size:13px;color:#c8d0e0;margin-bottom:6px;line-height:1.4">
        ${r.description || t("noDescription")}</p>
      <div style="font-size:11px;color:#8892a4;margin-bottom:2px">${r.location || ""}</div>
      <div style="font-size:11px;color:#8892a4">
        ${t("reportedBy")} ${r.reporter || t("anonymous")} · ${timeAgo(r.timestamp)}</div>
      ${credit}
      <div>${action}</div>
      ${baBtn}
    </div>`;
  }

  // Init map once
  useEffect(() => {
    if (mapInst.current) return;
    mapInst.current = L.map(mapRef.current, { center: [13.0827, 80.2707], zoom: 11 });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "\u00a9 OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapInst.current);

    mapInst.current.on("click", (e) => onMapClick?.(e.latlng.lat, e.latlng.lng));
  }, [onMapClick]);

  // Sync markers when reports change
  useEffect(() => {
    const map = mapInst.current;
    if (!map) return;

    const ids = new Set(reports.map((r) => r.id));
    Object.entries(markers.current).forEach(([id, m]) => {
      if (!ids.has(id)) { m.remove(); delete markers.current[id]; }
    });

    reports.forEach((r) => {
      if (!r.lat || !r.lng) return;
      if (markers.current[r.id]) {
        markers.current[r.id].setIcon(makeIcon(r.severity, r.status));
        markers.current[r.id].getPopup()?.setContent(popupHTML(r));
      } else {
        const m = L.marker([r.lat, r.lng], { icon: makeIcon(r.severity, r.status) })
          .bindPopup(popupHTML(r), { maxWidth: 280 })
          .addTo(map);
        markers.current[r.id] = m;
      }
    });

  }, [reports, leaderboard, t]);

  // Popup button clicks — delegated to document
  useEffect(() => {
    const handler = async (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const { id, action } = btn.dataset;

      if (action === "beforeafter") {
        const r = reports.find(rep => rep.id === id);
        if (r) setBaCard({ beforeUrl: r.imageUrl, afterUrl: r.afterImageUrl });
        return;
      }

      if (action === "claim") {
        const name = prompt(t("enterNameClaim"));
        if (!name?.trim()) return;
        btn.disabled = true;
        btn.textContent = t("updating");
        try {
          await claimReport(id, name.trim());
          mapInst.current?.closePopup();
          onRefresh?.();
        } catch (err) {
          alert("Error: " + err.message);
          btn.disabled = false;
        }
        return;
      }

      if (action === "clean") {
        const name = prompt(t("enterNameClean"));
        if (!name?.trim()) return;
        mapInst.current?.closePopup();
        setAfterModal({ id, volunteerName: name.trim() });
        return;
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);

  }, [onRefresh, reports, t]);

  async function handleAfterSubmit(reportId, volunteerName, afterImageUrl) {
    await cleanReport(reportId, volunteerName, afterImageUrl);
    setAfterModal(null);
    onRefresh?.();
  }

  return (
    <>
      <div ref={mapRef} className="map-container" />

      {afterModal && (
        <AfterPhotoModal
          reportId={afterModal.id}
          volunteerName={afterModal.volunteerName}
          onSubmit={handleAfterSubmit}
          onClose={() => setAfterModal(null)}
        />
      )}

      {baCard && (
        <BeforeAfterCard
          beforeUrl={baCard.beforeUrl}
          afterUrl={baCard.afterUrl}
          onClose={() => setBaCard(null)}
        />
      )}
    </>
  );
}
