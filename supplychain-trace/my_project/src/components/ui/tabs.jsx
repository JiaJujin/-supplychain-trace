import React, { createContext, useContext, useState } from "react";

const TabsContext = createContext(null);

export function Tabs({ defaultValue, children, className = "" }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = "" }) {
  return <div className={`bg-gray-100 rounded-md p-1 flex ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, children }) {
  const ctx = useContext(TabsContext);
  const active = ctx?.value === value;
  return (
    <button
      onClick={() => ctx?.setValue(value)}
      className={`flex-1 rounded-md px-3 py-2 text-sm ${active ? "bg-white shadow font-semibold text-gray-900" : "text-gray-600"}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "" }) {
  const ctx = useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return <div className={className}>{children}</div>;
}