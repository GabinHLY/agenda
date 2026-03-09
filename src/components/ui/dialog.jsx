import React from "react";
import { cn } from "@/lib/utils";

export function Dialog({ open, onOpenChange, children }) {
  const childArray = React.Children.toArray(children);
  const trigger = childArray.find((child) => child.type === DialogTrigger);
  const content = childArray.find((child) => child.type === DialogContent);

  return (
    <>
      {trigger ? React.cloneElement(trigger, { onOpenChange }) : null}
      {open && content ? React.cloneElement(content, { onOpenChange }) : null}
    </>
  );
}

export function DialogTrigger({ asChild, children, onOpenChange }) {
  if (!children) return null;
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props.onClick?.(e);
        onOpenChange?.(true);
      },
    });
  }

  return <button onClick={() => onOpenChange?.(true)}>{children}</button>;
}

export function DialogContent({ className, children, onOpenChange }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={cn("w-full max-w-lg rounded-xl bg-white p-6 shadow-xl", className)}>
        <button className="mb-3 text-sm text-slate-500 hover:text-slate-700" onClick={() => onOpenChange?.(false)}>
          Fermer
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn("mb-3", className)} {...props} />;
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={cn("text-xl font-semibold", className)} {...props} />;
}
