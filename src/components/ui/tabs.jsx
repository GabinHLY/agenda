import React, { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

const TabsContext = createContext(null);

export function Tabs({ value, onValueChange, children }) {
  return <TabsContext.Provider value={{ value, onValueChange }}>{children}</TabsContext.Provider>;
}

export function TabsList({ className, ...props }) {
  return <div className={cn("inline-flex items-center bg-slate-100 p-1", className)} {...props} />;
}

export function TabsTrigger({ value, className, children, ...props }) {
  const ctx = useContext(TabsContext);
  const isActive = ctx?.value === value;

  return (
    <button
      className={cn(
        "px-3 py-1.5 text-sm rounded-xl transition",
        isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
        className
      )}
      onClick={() => ctx?.onValueChange?.(value)}
      {...props}
    >
      {children}
    </button>
  );
}
