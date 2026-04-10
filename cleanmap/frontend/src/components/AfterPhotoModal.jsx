import React, { useState } from "react";
import { uploadImage } from "../api";
import { useLang } from "../i18n/LanguageContext";

export default function AfterPhotoModal({ reportId, volunteerName, onSubmit, onClose }) {
  const { t } = useLang();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    setError("");
    if (!file) return setError(t("afterPhotoRequired"));
    setLoading(true);
    try {
      const { data: imgData } = await uploadImage(file);
      await onSubmit(reportId, volunteerName, imgData.url);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2>{t("uploadAfterPhoto")}</h2>
          <button className="modal-close" onClick={onClose}>X</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "#c8d0e0", marginBottom: 16, lineHeight: 1.5 }}>
            {t("afterPhotoDesc")}
          </p>

          <div className="form-group">
            <div
              className="upload-area"
              onClick={() => document.getElementById("afterFileInput").click()}
            >
              {preview ? (
                <img src={preview} alt="preview" className="upload-preview" />
              ) : (
                t("clickUploadAfter")
              )}
            </div>
            <input
              id="afterFileInput"
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={handleFile}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="submit-btn" onClick={submit} disabled={loading}>
            {loading ? t("uploading") : t("submitCleanup")}
          </button>
        </div>
      </div>
    </div>
  );
}
