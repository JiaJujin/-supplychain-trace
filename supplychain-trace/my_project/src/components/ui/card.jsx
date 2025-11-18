import React from "react";

export function Card({ className = "", children, onClick }) {
  return (
    <div className={`border rounded-xl bg-white shadow-sm ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return <div className={`px-4 py-3 ${className}`}>{children}</div>;
}

export function CardContent({ className = "", children }) {
  return <div className={`px-4 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return <div className={`font-semibold ${className}`}>{children}</div>;
}