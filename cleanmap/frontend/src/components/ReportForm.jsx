import React, { useState, useEffect } from "react";
import { createReport, uploadImage } from "../api";
import { reverseGeocode } from "../utils/helpers";
import { useLang } from "../i18n/LanguageContext";

export default function ReportForm({ pinLat, pinLng, onSuccess, onClose }) {
  const { t } = useLang();
  const [coords,   setCoords]   = useState(pinLat ? { lat: pinLat, lng: pinLng } : null);
  const [severity, setSeverity] = useState("Medium");
  const [desc,     setDesc]     = useState("");
  const [reporter, setReporter] = useState("");
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [locating, setLocating] = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (pinLat && pinLng) setCoords({ lat: pinLat, lng: pinLng });
  }, [pinLat, pinLng]);

  const geolocate = () => {
    if (!navigator.geolocation) { setError(t("geoNotSupported")); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLocating(false);
      },
      () => {
        setError(t("geoFailed"));
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
    if (!coords) return setError(t("setLocation"));
    if (!file)   return setError(t("attachPhoto"));
    setLoading(true);
    try {
      const { data: imgData } = await uploadImage(file);
      const location = await reverseGeocode(coords.lat, coords.lng);
      await createReport({
        lat: coords.lat,
        lng: coords.lng,
        severity,
        description: desc,
        reporter: reporter.trim() || t("anonymous"),
        imageUrl: imgData.url,
        location,
      });
      onSuccess();
    } catch (e) {
      setError(`${t("submissionFailed")}: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2>{t("reportGarbageSpot")}</h2>
          <button className="modal-close" onClick={onClose}>X</button>
        </div>

        <div className="modal-body">
          {/* Location */}
          <div className="form-group">
            <label className="form-label">{t("location")} *</label>
            {coords ? (
              <div className="coord-box">
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                <button
                  onClick={() => setCoords(null)}
                  style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 16 }}
                >X</button>
              </div>
            ) : (
              <>
                <button className="btn-geo" onClick={geolocate} disabled={locating}>
                  {locating ? t("locating") : t("useMyLocation")}
                </button>
                <div className="or-text">{t("orClickMap")}</div>
                <div className="map-hint">{t("mapHint")}</div>
              </>
            )}
          </div>

          {/* Severity */}
          <div className="form-group">
            <label className="form-label">{t("severity")} *</label>
            <div className="sev-group">
              {["Low", "Medium", "High"].map((s) => (
                <div key={s} className={`sev-radio ${s.toLowerCase()}`}>
                  <input
                    type="radio" name="sev" id={`sev-${s}`} value={s}
                    checked={severity === s} onChange={() => setSeverity(s)}
                  />
                  <label htmlFor={`sev-${s}`}>{t(s.toLowerCase())}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Reporter name */}
          <div className="form-group">
            <label className="form-label">{t("yourName")}</label>
            <input
              type="text"
              placeholder={t("namePlaceholder")}
              value={reporter}
              onChange={(e) => setReporter(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">{t("description")}</label>
            <textarea
              rows={3}
              placeholder={t("descPlaceholder")}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {/* Photo */}
          <div className="form-group">
            <label className="form-label">{t("photo")} *</label>
            <div className="upload-area" onClick={() => document.getElementById("fileInput").click()}>
              {preview
                ? <img src={preview} alt="preview" className="upload-preview" />
                : t("clickAttach")}
            </div>
            <input
              id="fileInput" type="file" accept="image/*" capture="environment"
              style={{ display: "none" }} onChange={handleFile}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="submit-btn" onClick={submit} disabled={loading}>
            {loading ? t("submitting") : t("submitReport")}
          </button>
        </div>
      </div>
    </div>
  );
}
