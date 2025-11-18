import React from "react";

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => onOpenChange(false)}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

export function DialogContent({ className = "", children }) {
  return <div className={`bg-white rounded-md p-4 ${className}`}>{children}</div>;
}

export function DialogHeader({ children }) {
  return <div>{children}</div>;
}

export function DialogTitle({ children }) {
  return <div className="font-semibold text-base">{children}</div>;
}

export function DialogDescription({ children }) {
  return <div className="text-sm text-gray-600">{children}</div>;
}

export function DialogFooter({ children }) {
  return <div className="mt-3 flex justify-end gap-2">{children}</div>;
}