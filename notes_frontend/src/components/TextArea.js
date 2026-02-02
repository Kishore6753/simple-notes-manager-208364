import React from "react";

// PUBLIC_INTERFACE
export default function TextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  maxLength,
  disabled = false,
  required = false,
  rows = 8,
}) {
  /** Controlled multi-line textarea with label and inline error. */
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label} {required ? <span className="req">*</span> : null}
      </label>
      <textarea
        id={id}
        className={`textarea ${error ? "input-error" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      />
      {error ? (
        <div className="field-error" id={describedBy}>
          {error}
        </div>
      ) : null}
    </div>
  );
}
