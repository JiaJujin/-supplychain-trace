import React from "react";

export function Button({ className = "", variant = "default", size = "md", disabled, onClick, children }) {
  const base = "inline-flex items-center justify-center rounded-md text-sm transition-colors";
  const sizes = {
    md: "px-3 py-2",
    sm: "px-2.5 py-1.5 text-xs",
    icon: "h-9 w-9",
  };
  const variants = {
    default: "bg-gray-900 text-white",
    secondary: "bg-gray-100 text-gray-900",
    outline: "border border-gray-300 bg-white text-gray-900",
  };
  const state = disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90";
  return (
    <button className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.default} ${state} ${className}`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}