import React from "react";
import { cn } from "@/lib/utils";

export function Checkbox({ checked, onCheckedChange, className, ...props }) {
  return (
    <input
      type="checkbox"
      checked={Boolean(checked)}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className={cn("h-4 w-4 rounded border-slate-300 text-slate-900", className)}
      {...props}
    />
  );
}
