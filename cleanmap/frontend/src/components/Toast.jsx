import React, { useEffect, useState } from "react";

export default function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = setTimeout(() => { setVisible(false); onDone?.(); }, 3000);
    return () => clearTimeout(t);
  }, [message, onDone]);

  return (
    <div className={`toast ${visible ? "show" : ""}`}>
      {message}
    </div>
  );
}
