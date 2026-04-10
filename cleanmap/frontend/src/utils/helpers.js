// ── Time ──────────────────────────────────────────────────────────────
export function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  if (diff < 60_000)        return "just now";
  if (diff < 3_600_000)     return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)    return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

// ── Severity colours ──────────────────────────────────────────────────
export const SEV_COLOR = { Low: "#22c55e", Medium: "#f97316", High: "#ef4444" };

// ── Haversine distance in km ──────────────────────────────────────────
export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Reverse geocode via Nominatim (free, no key needed) ───────────────
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    return data.display_name?.split(",").slice(0, 3).join(", ") || "Unknown location";
  } catch {
    return "Unknown location";
  }
}
