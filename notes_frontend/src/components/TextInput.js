import React from "react";

// PUBLIC_INTERFACE
export default function TextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  maxLength,
  disabled = false,
  required = false,
  autoFocus = false,
}) {
  /** Controlled single-line input with label and inline error. */
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label} {required ? <span className="req">*</span> : null}
      </label>
      <input
        id={id}
        className={`input ${error ? "input-error" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
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
