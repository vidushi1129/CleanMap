import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SEV_COLOR, timeAgo } from "../utils/helpers";
import { claimReport, cleanReport } from "../api";

function makeIcon(severity, status) {
  const col = SEV_COLOR[severity] || "#888";
  const opacity = status === "CLEANED" ? 0.5 : 1;
  const ring = status === "IN_PROGRESS"
    ? `<circle cx="16" cy="16" r="13" fill="none" stroke="${col}" stroke-width="2.5"
        stroke-dasharray="5 3" opacity="0.9"/>`
    : "";
  const pulse = status === "IN_PROGRESS" ? 'class="pulse-marker"' : "";
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

function popupHTML(r) {
  const col = SEV_COLOR[r.severity] || "#888";
  const img = r.imageUrl
    ? `<img src="${r.imageUrl}" style="width:100%;height:130px;object-fit:cover;border-radius:8px;
        margin-bottom:10px;display:block" onerror="this.style.display='none'" alt=""/>`
    : "";
  const credit = r.claimedBy
    ? `<div style="font-size:11px;color:#4ade80;margin-top:4px">
        ${r.status === "CLEANED" ? "✅ Cleaned" : "🔧 Claimed"} by ${r.claimedBy}</div>`
    : "";
  let action = "";
  if (r.status === "PENDING")
    action = `<button data-id="${r.id}" data-action="claim"
      style="background:#3b82f6;color:#fff;border:none;padding:6px 14px;border-radius:6px;
      font-size:12px;font-weight:600;cursor:pointer;margin-top:8px">🙋 Claim for Cleanup</button>`;
  if (r.status === "IN_PROGRESS")
    action = `<button data-id="${r.id}" data-action="clean"
      style="background:#16a34a;color:#fff;border:none;padding:6px 14px;border-radius:6px;
      font-size:12px;font-weight:600;cursor:pointer;margin-top:8px">✅ Mark as Cleaned</button>`;
  if (r.status === "CLEANED")
    action = `<span style="display:inline-block;margin-top:8px;padding:4px 10px;
      background:rgba(34,197,94,.15);color:#4ade80;border-radius:6px;font-size:12px">✓ Cleaned</span>`;

  return `<div style="font-family:system-ui;min-width:220px;padding:12px">
    ${img}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <span style="background:${col}22;color:${col};padding:2px 8px;border-radius:4px;
        font-size:11px;font-weight:600">${r.severity}</span>
      <span style="font-size:11px;color:#8892a4">${r.status.replace("_", " ")}</span>
    </div>
    <p style="font-size:13px;color:#c8d0e0;margin-bottom:6px;line-height:1.4">
      ${r.description || "No description."}</p>
    <div style="font-size:11px;color:#8892a4;margin-bottom:2px">📍 ${r.location || ""}</div>
    <div style="font-size:11px;color:#8892a4">
      Reported by ${r.reporter || "Anonymous"} · ${timeAgo(r.timestamp)}</div>
    ${credit}
    <div>${action}</div>
  </div>`;
}

export default function MapView({ reports, onMapClick, onRefresh }) {
  const mapRef   = useRef(null);
  const mapInst  = useRef(null);
  const markers  = useRef({});

  // Init map once
  useEffect(() => {
    if (mapInst.current) return;
    mapInst.current = L.map(mapRef.current, { center: [13.0827, 80.2707], zoom: 11 });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapInst.current);

    mapInst.current.on("click", (e) => onMapClick?.(e.latlng.lat, e.latlng.lng));
  }, [onMapClick]);

  // Sync markers when reports change
  useEffect(() => {
    const map = mapInst.current;
    if (!map) return;

    // Remove stale markers
    const ids = new Set(reports.map((r) => r.id));
    Object.entries(markers.current).forEach(([id, m]) => {
      if (!ids.has(id)) { m.remove(); delete markers.current[id]; }
    });

    // Add or update
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
  }, [reports]);

  // Popup button clicks (claim / clean) — delegated to document
  useEffect(() => {
    const handler = async (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const { id, action } = btn.dataset;
      const name = prompt(
        action === "claim"
          ? "Enter your name to claim this spot:"
          : "Enter your name to mark as cleaned:"
      );
      if (!name?.trim()) return;
      btn.disabled = true;
      btn.textContent = "Updating…";
      try {
        if (action === "claim") await claimReport(id, name.trim());
        if (action === "clean") await cleanReport(id, name.trim());
        mapInst.current?.closePopup();
        onRefresh?.();
      } catch (err) {
        alert("Error: " + err.message);
        btn.disabled = false;
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [onRefresh]);

  return <div ref={mapRef} className="map-container" />;
}
