import React from "react";

// PUBLIC_INTERFACE
export default function Button({
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  isLoading = false,
  onClick,
  children,
  ariaLabel,
}) {
  /** Reusable button with retro theme styling. */
  const className = ["btn", `btn-${variant}`, `btn-${size}`].join(" ");

  return (
    <button
      type={type}
      className={className}
      disabled={disabled || isLoading}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {isLoading ? "Working..." : children}
    </button>
  );
}
