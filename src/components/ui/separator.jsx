import React from "react";
import { cn } from "@/lib/utils";

export function Separator({ className, ...props }) {
  return <div className={cn("h-px w-full bg-slate-200", className)} role="separator" {...props} />;
}
