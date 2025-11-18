import React from "react";

export function Progress({ value = 0, className = "" }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full bg-gray-200 rounded h-2 overflow-hidden ${className}`}>
      <div className="bg-gray-900 h-full" style={{ width: `${v}%` }} />
    </div>
  );
}