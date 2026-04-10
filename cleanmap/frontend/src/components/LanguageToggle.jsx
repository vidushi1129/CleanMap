import React from "react";
import { useLang } from "../i18n/LanguageContext";

export default function LanguageToggle() {
  const { lang, setLang, t } = useLang();

  return (
    <div className="lang-toggle">
      <button
        className={`lang-btn ${lang === "en" ? "lang-active" : ""}`}
        onClick={() => setLang("en")}
      >
        {t("english")}
      </button>
      <button
        className={`lang-btn ${lang === "ta" ? "lang-active" : ""}`}
        onClick={() => setLang("ta")}
      >
        {t("tamil")}
      </button>
    </div>
  );
}
