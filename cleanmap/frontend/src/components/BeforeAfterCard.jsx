import React, { useState } from "react";
import { useLang } from "../i18n/LanguageContext";

export default function BeforeAfterCard({ beforeUrl, afterUrl, onClose }) {
  const { t } = useLang();
  const [slider, setSlider] = useState(50);

  if (!beforeUrl && !afterUrl) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="ba-modal">
        <div className="modal-head">
          <h2>{t("beforeAfter")}</h2>
          <button className="modal-close" onClick={onClose}>X</button>
        </div>
        <div className="ba-body">
          {beforeUrl && afterUrl ? (
            <>
              <div className="ba-slider-container">
                <div className="ba-image-wrapper">
                  <img src={beforeUrl} alt="Before" className="ba-img ba-before" />
                  <div className="ba-after-clip" style={{ width: `${slider}%` }}>
                    <img src={afterUrl} alt="After" className="ba-img ba-after" />
                  </div>
                  <div className="ba-divider" style={{ left: `${slider}%` }}>
                    <div className="ba-handle">||</div>
                  </div>
                  <input
                    type="range"
                    min="0" max="100"
                    value={slider}
                    onChange={(e) => setSlider(Number(e.target.value))}
                    className="ba-range"
                  />
                </div>
              </div>
              <div className="ba-labels">
                <span className="ba-label-before">{t("before")}</span>
                <span className="ba-label-after">{t("after")}</span>
              </div>
            </>
          ) : (
            <div className="ba-single">
              {beforeUrl && (
                <div className="ba-single-card">
                  <div className="ba-single-label">{t("before")}</div>
                  <img src={beforeUrl} alt="Before" className="ba-single-img" />
                </div>
              )}
              {afterUrl && (
                <div className="ba-single-card">
                  <div className="ba-single-label">{t("after")}</div>
                  <img src={afterUrl} alt="After" className="ba-single-img" />
                </div>
              )}
              {!afterUrl && (
                <div className="ba-no-after">
                  <p>{t("noAfterPhoto")}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
