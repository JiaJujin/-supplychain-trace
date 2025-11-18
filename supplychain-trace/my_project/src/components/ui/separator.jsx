import React from "react";

export function Separator({ className = "" }) {
  return <hr className={`border-t ${className}`} />;
}