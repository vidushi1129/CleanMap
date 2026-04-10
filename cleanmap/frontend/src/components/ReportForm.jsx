import React, { useState, useEffect } from "react";
import { createReport, uploadImage } from "../api";
import { reverseGeocode } from "../utils/helpers";

export default function ReportForm({ pinLat, pinLng, onSuccess, onClose }) {
  const [coords,   setCoords]   = useState(pinLat ? { lat: pinLat, lng: pinLng } : null);
  const [severity, setSeverity] = useState("Medium");
  const [desc,     setDesc]     = useState("");
  const [reporter, setReporter] = useState("");
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [locating, setLocating] = useState(false);
  const [error,    setError]    = useState("");

  // If a pin was dropped on the map, use those coords immediately
  useEffect(() => {
    if (pinLat && pinLng) setCoords({ lat: pinLat, lng: pinLng });
  }, [pinLat, pinLng]);

  const geolocate = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLocating(false);
      },
      () => {
        setError("Could not get location. Click the map to drop a pin.");
        setLocating(false);
      }
    );
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    setError("");
    if (!coords) return setError("Set a location — use My Location or click the map.");
    if (!file)   return setError("Please attach a photo of the waste.");
    setLoading(true);
    try {
      // 1. Upload image first
      const { data: imgData } = await uploadImage(file);

      // 2. Reverse geocode
      const location = await reverseGeocode(coords.lat, coords.lng);

      // 3. Create report
      await createReport({
        lat: coords.lat,
        lng: coords.lng,
        severity,
        description: desc,
        reporter: reporter.trim() || "Anonymous",
        imageUrl: imgData.url,
        location,
      });

      onSuccess();
    } catch (e) {
      setError("Submission failed: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2>📍 Report Garbage Spot</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Location */}
          <div className="form-group">
            <label className="form-label">Location *</label>
            {coords ? (
              <div className="coord-box">
                ✅ {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                <button
                  onClick={() => setCoords(null)}
                  style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 16 }}
                >✕</button>
              </div>
            ) : (
              <>
                <button className="btn-geo" onClick={geolocate} disabled={locating}>
                  {locating ? "📡 Locating…" : "📡 Use My Location"}
                </button>
                <div className="or-text">— or click anywhere on the map —</div>
                <div className="map-hint">Tap the map to drop a pin, then open the form</div>
              </>
            )}
          </div>

          {/* Severity */}
          <div className="form-group">
            <label className="form-label">Severity *</label>
            <div className="sev-group">
              {[["Low","🟢"], ["Medium","🟠"], ["High","🔴"]].map(([s, emoji]) => (
                <div key={s} className={`sev-radio ${s.toLowerCase()}`}>
                  <input
                    type="radio" name="sev" id={`sev-${s}`} value={s}
                    checked={severity === s} onChange={() => setSeverity(s)}
                  />
                  <label htmlFor={`sev-${s}`}>{emoji} {s}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Reporter name */}
          <div className="form-group">
            <label className="form-label">Your Name (for credit)</label>
            <input
              type="text"
              placeholder="e.g. Priya S. or Anonymous"
              value={reporter}
              onChange={(e) => setReporter(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              placeholder="Describe what you see — type of waste, size, smell, nearby landmark…"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {/* Photo */}
          <div className="form-group">
            <label className="form-label">Photo *</label>
            <div className="upload-area" onClick={() => document.getElementById("fileInput").click()}>
              {preview
                ? <img src={preview} alt="preview" className="upload-preview" />
                : "📷 Click to attach a photo"}
            </div>
            <input
              id="fileInput" type="file" accept="image/*" capture="environment"
              style={{ display: "none" }} onChange={handleFile}
            />
          </div>

          {error && <p className="form-error">⚠️ {error}</p>}

          <button className="submit-btn" onClick={submit} disabled={loading}>
            {loading ? "Submitting…" : "🚨 Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
