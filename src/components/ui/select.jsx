import React from "react";
import { cn } from "@/lib/utils";

export function Select({ value, onValueChange, children }) {
  const items = [];

  React.Children.forEach(children, (child) => {
    if (child?.type === SelectContent) {
      React.Children.forEach(child.props.children, (item) => {
        if (item?.type === SelectItem) {
          items.push({ value: item.props.value, label: item.props.children });
        }
      });
    }
  });

  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
    >
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

export function SelectTrigger({ className, children }) {
  return <div className={cn(className)}>{children}</div>;
}

export function SelectValue() {
  return null;
}

export function SelectContent({ children }) {
  return <>{children}</>;
}

export function SelectItem() {
  return null;
}
