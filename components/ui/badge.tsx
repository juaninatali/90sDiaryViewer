import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline"; // <== Accept variant prop
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", onClick, onKeyDown, role, tabIndex, ...props }, ref) => {
    const interactive = typeof onClick === "function";

    return (
      <div
        ref={ref}
        role={interactive ? "button" : role}
        tabIndex={interactive ? 0 : tabIndex}
        onClick={onClick}
        onKeyDown={interactive ? (event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            event.currentTarget.click();
          }
        } : onKeyDown}
        className={cn(
          "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          interactive && "min-h-11 px-3 cursor-pointer select-none",
          variant === "default" && "bg-primary text-primary-foreground",
          variant === "outline" && "border-border bg-background text-foreground",
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
