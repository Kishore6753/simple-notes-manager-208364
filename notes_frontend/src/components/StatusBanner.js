import React from "react";

// PUBLIC_INTERFACE
export default function StatusBanner({ kind = "info", title, message }) {
  /** Status banner component used for loading/errors/info messages. */
  if (!title && !message) return null;

  return (
    <div className={`status status-${kind}`} role={kind === "error" ? "alert" : "status"}>
      {title ? <div className="status-title">{title}</div> : null}
      {message ? <div className="status-message">{message}</div> : null}
    </div>
  );
}
