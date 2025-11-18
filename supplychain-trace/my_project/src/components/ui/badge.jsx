import React from "react";

export function Badge({ className = "", variant = "secondary", children }) {
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs";
  const style = variant === "default" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900 border border-gray-200";
  return <span className={`${base} ${style} ${className}`}>{children}</span>;
}